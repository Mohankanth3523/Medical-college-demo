"use client";

import { useId, useMemo, useState } from "react";
import { useRegistration } from "@/lib/registration/context";
import { allEvents, getEventById } from "@/data/events";
import { formatEventFee } from "@/lib/events/formatFee";
import { EVENT_GROUPS, EVENT_GROUP_LABEL, EVENT_GROUP_CATEGORIES, type EventGroup } from "@/lib/events/eventGroups";
import { EventCard } from "@/components/events/EventCard";
import { OrnamentalFrame } from "@/components/design-system";
import type { AffinityEvent } from "@/types/event";

/** Hand-drawn "×" glyph for the remove-event control — matches the project's no-icon-library convention (see EventBadge's AlertGlyph). */
function RemoveGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
      <line x1="1.5" y1="1.5" x2="10.5" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.5" y1="1.5" x2="1.5" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Step 02 — "Choose Your Tales". Multi-select event picker, reading
 * `allEvents` straight from the centralized data layer (this step is
 * already inside a client-only route subtree — `app/register/layout.tsx`
 * — so, unlike the public Events Explorer's Server→Client split, there's
 * no server boundary to pass data through; `EventPreselect`, Phase 10,
 * already established the same direct-import pattern here).
 *
 * Reuses `EventCard` (its Phase 13 `selected`/`onToggleSelect` mode, not
 * `onViewDetails` — this step's own brief doesn't ask for a details
 * drawer) and the same three-way category grouping the public Events
 * Explorer uses (`lib/events/eventGroups.ts`, extracted this phase so
 * both consumers share one definition). "Do not invent restrictions":
 * every event in `data/events/*` is selectable here — there is no
 * eligibility-matching logic cross-checking a participant's year of
 * study against an event's `eligibility` text, because no source
 * document defines that as a structured, enforceable rule (see
 * `docs/phase-13-events-step-notes.md`).
 */
export function EventsStep() {
  const { state, dispatch } = useRegistration();
  const [group, setGroup] = useState<EventGroup>("all");
  const [query, setQuery] = useState("");
  const searchId = useId();
  const resultsId = useId();

  const selectedIds = useMemo(
    () => new Set(state.selectedEvents.map((selection) => selection.eventId)),
    [state.selectedEvents],
  );

  const selectedEvents = useMemo(
    () =>
      state.selectedEvents
        .map((selection) => getEventById(selection.eventId))
        .filter((event): event is AffinityEvent => Boolean(event)),
    [state.selectedEvents],
  );

  const filtered = useMemo(() => {
    const categories = group === "all" ? null : EVENT_GROUP_CATEGORIES[group];
    const q = query.trim().toLowerCase();
    return allEvents.filter((event) => {
      if (categories && !categories.includes(event.category)) return false;
      if (!q) return true;
      const haystack = event.description ? `${event.name} ${event.description}` : event.name;
      return haystack.toLowerCase().includes(q);
    });
  }, [group, query]);

  function toggleEvent(event: AffinityEvent) {
    dispatch(
      selectedIds.has(event.id)
        ? { type: "DESELECT_EVENT", eventId: event.id }
        : { type: "SELECT_EVENT", eventId: event.id },
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-2xl font-semibold tracking-wide text-ivory">Choose Your Tales</h3>
        <p className="font-accent text-base italic text-warm-gold">
          Sports, culturals, and courts beyond — enter as many as your story allows.
        </p>
      </div>

      <OrnamentalFrame padding="sm" className="mt-6">
        <h4 className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand">
          Your Chosen Tales ({selectedEvents.length})
        </h4>

        {selectedEvents.length === 0 ? (
          <p className="mt-2 font-body text-sm text-desert-sand/80">
            No tales chosen yet — select from the courts below.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {selectedEvents.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-3 border border-antique-gold/20 px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="font-body text-sm font-medium text-ivory">{event.name}</span>
                  <span className="font-body text-xs text-desert-sand">{formatEventFee(event.fee)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "DESELECT_EVENT", eventId: event.id })}
                  aria-label={`Remove ${event.name}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 border border-antique-gold/30 px-3 font-body text-xs font-medium uppercase tracking-wide text-desert-sand transition-colors duration-fast hover:border-error-rose/60 hover:text-error-rose"
                >
                  <RemoveGlyph />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </OrnamentalFrame>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter events by category" className="flex flex-wrap gap-2">
          {EVENT_GROUPS.map((g) => {
            const active = g === group;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={active}
                onClick={() => setGroup(g)}
                className={[
                  "min-h-11 border px-4 py-2 font-body text-sm font-medium uppercase tracking-wide transition-colors duration-base",
                  active
                    ? "border-antique-gold bg-antique-gold text-midnight"
                    : "border-antique-gold/40 text-desert-sand hover:border-antique-gold/70 hover:text-ivory",
                ].join(" ")}
              >
                {EVENT_GROUP_LABEL[g]}
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-72">
          <label htmlFor={searchId} className="sr-only">
            Search events by name
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events…"
            aria-describedby={resultsId}
            className="min-h-11 w-full border border-antique-gold/40 bg-royal-navy/60 px-4 py-2 font-body text-sm text-ivory placeholder:text-desert-sand"
          />
        </div>
      </div>

      <p id={resultsId} aria-live="polite" className="mt-4 font-body text-sm text-desert-sand">
        {filtered.length} {filtered.length === 1 ? "event" : "events"} found
      </p>

      {filtered.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              selected={selectedIds.has(event.id)}
              onToggleSelect={toggleEvent}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-2 border border-antique-gold/20 px-6 py-16 text-center">
          <p className="font-accent text-lg italic text-warm-gold">No arenas match your search.</p>
          <p className="font-body text-sm text-desert-sand">Try a different name, or clear the filters above.</p>
        </div>
      )}
    </div>
  );
}
