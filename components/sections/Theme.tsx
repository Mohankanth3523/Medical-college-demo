import {
  Crescent,
  GoldDivider,
  OrnamentalFrame,
  PalaceSilhouette,
  ScrollReveal,
  SectionContainer,
} from "@/components/design-system";
import { aboutTheme, aboutThemeBrochureVariant } from "@/data/content";

/**
 * "The Theme — Arabian Nights." Replaces the Phase 02 placeholder that
 * used to sit here (a bare `<h2>`/`<p>` with no container, no responsive
 * classes, and no design-system components — see git history / the old
 * `app/page.tsx`), which is what made it "not responsive and not in
 * proper structure": everything below is built from the same reusable
 * pieces (`SectionContainer`, `OrnamentalFrame`, `ScrollReveal`,
 * `GoldDivider`) every other landing-page section already uses, so it
 * gets the same responsive behavior, spacing rhythm, and typography
 * scale for free instead of being hand-rolled.
 *
 * Source: `docs/affinity-content-truth.md` §2. "Arabian Nights" as the
 * theme name is stated directly by the project brief itself, not
 * inferred — and §2 quotes two verbatim theme descriptions across the
 * source documents ("both consistent, no conflict — the brochure's is
 * the newer/longer version"). Rather than picking one or paraphrasing
 * them together, both are shown side by side as two attributed quotes —
 * the same "quote the source exactly" approach `Story.tsx` already uses
 * for `aboutAffinity`/`aboutAffinityBrochureVariant`, and for the same
 * reason: paraphrasing organizer copy risks quietly changing its
 * meaning, where quoting it exactly can't.
 *
 * Visual motif: a single low-opacity `PalaceSilhouette` along the
 * section's bottom edge (reusing the same component `Hero`/
 * `AtmosphereBackground` already use, at a lower opacity here — texture,
 * not a second hero moment) plus one `Crescent` beside the eyebrow,
 * echoing the wordmark. No new decorative SVG was drawn for this
 * section.
 */
export function Theme() {
  return (
    <section aria-labelledby="theme-heading" className="relative overflow-hidden">
      <PalaceSilhouette
        gapColor="#070A18"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-antique-gold/[0.08] sm:h-32 lg:h-40"
      />

      <SectionContainer as="div" width="content" verticalPadding className="relative z-10">
        <ScrollReveal>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 font-accent text-lg italic tracking-wide text-warm-gold sm:text-xl">
              <Crescent size={20} className="shrink-0" />
              <span>The Theme</span>
            </div>
            <h2
              id="theme-heading"
              className="font-display text-4xl font-semibold tracking-wide text-ivory sm:text-5xl lg:text-6xl"
            >
              Arabian Nights
            </h2>
            <GoldDivider size="lg" />
          </div>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 lg:grid-cols-2 lg:gap-8">
          <ScrollReveal>
            <OrnamentalFrame padding="md" className="flex h-full flex-col">
              <blockquote>
                <p className="font-body text-base leading-relaxed text-ivory sm:text-lg">
                  &ldquo;{aboutTheme}&rdquo;
                </p>
                <cite className="mt-4 block font-body text-xs not-italic uppercase tracking-[0.2em] text-warm-gold/80">
                  &mdash; From the official AFFINITY &apos;26 wordings document
                </cite>
              </blockquote>
            </OrnamentalFrame>
          </ScrollReveal>

          <ScrollReveal delayMs={150}>
            <OrnamentalFrame padding="md" className="flex h-full flex-col">
              <blockquote>
                <p className="font-accent text-lg italic leading-relaxed text-desert-sand sm:text-xl">
                  &ldquo;{aboutThemeBrochureVariant}&rdquo;
                </p>
                <cite className="mt-4 block font-body text-xs not-italic uppercase tracking-[0.2em] text-warm-gold/80">
                  &mdash; From the official AFFINITY &apos;26 brochure
                </cite>
              </blockquote>
            </OrnamentalFrame>
          </ScrollReveal>
        </div>
      </SectionContainer>
    </section>
  );
}
