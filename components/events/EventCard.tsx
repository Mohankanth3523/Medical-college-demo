import type { MouseEvent } from "react";
import type { AffinityEvent } from "@/types/event";
import { EventBadge, OrnamentalFrame } from "@/components/design-system";
import { formatEventFee } from "@/lib/events/formatFee";
import { TYPE_LABEL } from "@/lib/events/eventLabels";

export interface EventCardProps {
  event: AffinityEvent;
  /**
   * Phase 10: when provided, renders a "View Details" trigger at the
   * card's foot that opens `EventDetailsModal` for this event. Passing
   * the clicked button element back (rather than the card grabbing its
   * own ref) lets the caller manage one shared "return focus here on
   * close" ref instead of every card needing its own. Omitted entirely
   * — no dead button — when the card is used somewhere non-interactive.
   */
  onViewDetails?: (event: AffinityEvent, trigger: HTMLButtonElement) => void;
  /**
   * Phase 13: when provided, renders a full-width select/selected toggle
   * at the card's foot instead — the registration wizard's Events step
   * multi-select. `selected` drives both the toggle's label/icon and a
   * subtle gold ring around the whole card. Independent of
   * `onViewDetails` (a card could in principle render both footers, one
   * above the other, though no current caller passes both).
   */
  selected?: boolean;
  onToggleSelect?: (event: AffinityEvent) => void;
  /**
   * Phase 23 (accessibility audit): the event name's own heading level.
   * `EventsExplorer` renders a page with its own `<h1>` ("The Royal
   * Courts") and nothing else at `h2` before the card grid, so its cards
   * pass `"h2"` to keep the outline correct (no `h1`→`h3` skip). The
   * registration wizard's `EventsStep` sits under a `<h2>`/`<h3>` pair
   * already (`RegistrationStep`'s "Events", then this step's own "Choose
   * Your Tales"), so it leaves this at the default — repeating `h3` for
   * each card there is a sibling-list heading, not a skip.
   * @default "h3"
   */
  headingLevel?: "h2" | "h3";
}

/** Plain checkbox-style glyph — filled/checked when selected, empty outline otherwise. Hand-drawn to match `EventBadge`'s existing no-icon-library convention. */
function SelectGlyph({ selected }: { selected: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0">
      <rect x="1.25" y="1.25" width="13.5" height="13.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      {selected ? (
        <path
          d="M3.7 8.3 L6.6 11.2 L12.3 4.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}

/**
 * One event's summary card. Presentational — no hooks of its own, no
 * data fetching — reused by `EventsExplorer`'s grid, and shaped to be
 * reusable later wherever else an event needs a compact summary (e.g.
 * the registration wizard's own event-selection step). `onViewDetails`
 * is a plain callback prop, not a hook, so this file still doesn't need
 * `"use client"` itself — it only behaves like client code because
 * `EventsExplorer`, its one caller so far, already is.
 *
 * Every displayed field is read straight off the `AffinityEvent` passed
 * in; the only thing this component computes is formatting
 * (`formatEventFee`), never a new fact. Two fields are conditionally
 * omitted rather than shown with a placeholder: `description` (some
 * events don't have a one-line summary in the source data) and the
 * limited-slot indicator (only rendered when `limitedSlots.isLimited`
 * is explicitly `true` in the data — never a fabricated "X spots left"
 * count, since this frontend has no live registration numbers to
 * report).
 */
export function EventCard({
  event,
  onViewDetails,
  selected,
  onToggleSelect,
  headingLevel: HeadingTag = "h3",
}: EventCardProps) {
  const showVerificationFlag = event.verificationStatus !== "confirmed";
  const isLimited = event.limitedSlots?.isLimited === true;

  function handleViewDetails(clickEvent: MouseEvent<HTMLButtonElement>) {
    onViewDetails?.(event, clickEvent.currentTarget);
  }

  return (
    <OrnamentalFrame
      as="article"
      padding="sm"
      interactive
      className={["flex h-full flex-col gap-3", selected ? "ring-1 ring-antique-gold" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <EventBadge variant="category" value={event.category} />
        <EventBadge variant="mode" value={event.mode} />
      </div>

      <HeadingTag className="font-display text-lg font-semibold leading-snug text-ivory sm:text-xl">
        {event.name}
      </HeadingTag>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-sm text-desert-sand">
        <span>{TYPE_LABEL[event.type]}</span>
        <span aria-hidden="true">&middot;</span>
        <span>{formatEventFee(event.fee)}</span>
      </div>

      {event.description ? (
        <p className="font-body text-sm leading-relaxed text-desert-sand sm:text-base">
          {event.description}
        </p>
      ) : null}

      {isLimited || showVerificationFlag ? (
        <div className="flex flex-wrap gap-2">
          {isLimited ? (
            <span className="inline-flex items-center gap-1.5 border border-antique-gold/50 px-2.5 py-1 font-body text-xs font-medium uppercase tracking-wide text-antique-gold">
              {event.limitedSlots?.cap ? `Limited — First ${event.limitedSlots.cap}` : "Limited Slots"}
            </span>
          ) : null}
          {showVerificationFlag ? (
            <EventBadge variant="verification" value={event.verificationStatus} />
          ) : null}
        </div>
      ) : null}

      {onViewDetails ? (
        <button
          type="button"
          onClick={handleViewDetails}
          className="mt-auto inline-flex min-h-11 items-center gap-1.5 border-t border-antique-gold/20 pt-3 text-left font-body text-sm font-medium uppercase tracking-wide text-antique-gold transition-colors duration-fast hover:text-warm-gold"
        >
          View Details
          <span aria-hidden="true">&rarr;</span>
        </button>
      ) : null}

      {onToggleSelect ? (
        <button
          type="button"
          aria-pressed={Boolean(selected)}
          onClick={() => onToggleSelect(event)}
          className={[
            "mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 border-t pt-3 font-body text-sm font-semibold uppercase tracking-wide transition-colors duration-fast",
            selected
              ? "border-antique-gold/40 text-antique-gold"
              : "border-antique-gold/20 text-desert-sand hover:text-ivory",
          ].join(" ")}
        >
          <SelectGlyph selected={Boolean(selected)} />
          {selected ? "Selected" : "Select This Event"}
        </button>
      ) : null}
    </OrnamentalFrame>
  );
}
