import { GoldButton, GoldDivider, OrnamentalFrame, ScrollReveal, SectionContainer } from "@/components/design-system";
import { eventCounts } from "@/data/events";

/**
 * The landing page's Events teaser. Replaces the Phase 02 placeholder
 * that used to sit here — a bare `<h2>`/`<p>`/plain-text `<Link>` with no
 * container, no responsive classes, and none of the design-system
 * components every other landing-page section now uses (same gap Theme
 * had, and Cause had before its Phase 24 fix — see
 * `docs/phase-25-events-teaser-notes.md`).
 *
 * Every number here is `eventCounts` (`data/events/index.ts`), a plain
 * `.length` count of the real event records — nothing here is a
 * fabricated or rounded figure. The three-way Sports/Culturals/Online
 * split mirrors the same grouping the public Events Explorer and the
 * registration wizard's Events step already use
 * (`lib/events/eventGroups.ts`'s `EVENT_GROUP_CATEGORIES`), just summed
 * into a count instead of used as a filter — Culturals combines the
 * onstage + offstage cultural categories, Online combines online-
 * cultural + online-esports, matching that existing taxonomy exactly
 * rather than inventing a different grouping for this one section.
 *
 * "The Royal Courts" is the same design-copy name the real `/events`
 * page's own heading already uses (`EventsExplorer.tsx`) — this section
 * is a preview of that page, so it reuses its name rather than inventing
 * a second one for the same destination.
 */
const STATS = [
  { label: "Sports", value: eventCounts.sports },
  { label: "Culturals", value: eventCounts.culturalOnstage + eventCounts.culturalOffstage },
  { label: "Online", value: eventCounts.onlineCultural + eventCounts.onlineEsports },
] as const;

export function EventsTeaser() {
  return (
    <section aria-labelledby="events-teaser-heading" className="relative overflow-hidden">
      <SectionContainer as="div" width="content" verticalPadding className="relative z-10">
        <ScrollReveal>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="font-accent text-lg italic tracking-wide text-warm-gold sm:text-xl">Events</p>
            <h2
              id="events-teaser-heading"
              className="font-display text-4xl font-semibold tracking-wide text-ivory sm:text-5xl lg:text-6xl"
            >
              The Royal Courts Await
            </h2>
            <GoldDivider size="lg" />
            <p className="max-w-xl font-body text-base text-desert-sand sm:text-lg">
              {eventCounts.total} events across sports, culturals, and online categories.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={120}>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-6">
            {STATS.map((stat) => (
              <OrnamentalFrame
                key={stat.label}
                padding="md"
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <span className="font-display text-4xl font-semibold text-antique-gold sm:text-5xl">
                  {stat.value}
                </span>
                <span className="font-body text-xs font-medium uppercase tracking-[0.2em] text-desert-sand">
                  {stat.label}
                </span>
              </OrnamentalFrame>
            ))}
          </div>
        </ScrollReveal>

        <div className="mt-10 flex justify-center sm:mt-12">
          <GoldButton href="/events">Explore All Events</GoldButton>
        </div>
      </SectionContainer>
    </section>
  );
}
