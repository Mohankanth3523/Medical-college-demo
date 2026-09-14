import { BrandLogo } from "@/components/design-system/BrandLogo";
import type { DigitalPartner } from "@/data/branding";

export interface DigitalPartnersProps {
  partners: readonly DigitalPartner[];
  /** @default "h-14 sm:h-16" — see docs/phase-29-brand-logo-integration-notes.md for why this specific height was chosen for the homepage section. */
  heightClassName?: string;
  /** @default "md" */
  padding?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Phase 29 — reusable, data-driven digital-partner strip, per the brief's
 * own instruction #10 ("Create a reusable DigitalPartners component").
 * Every partner in `partners` renders at the *same* `heightClassName` and
 * `padding` — equal treatment between digital partners is a hierarchy
 * rule from the brief, not an accident of this being the only two
 * partners supplied so far, so a future third partner slots in at the
 * same size automatically rather than needing a bespoke prop per entry.
 *
 * A partner is only ever wrapped in a link when `partner.href` is set.
 * Per `data/branding.ts`, neither supplied partner has an official URL on
 * file, so both currently render as plain, unlinked marks — never a
 * guessed or placeholder `href`.
 */
export function DigitalPartners({
  partners,
  heightClassName = "h-14 sm:h-16",
  padding = "md",
  className = "",
}: DigitalPartnersProps) {
  if (partners.length === 0) return null;

  return (
    <div
      className={["flex flex-wrap items-center justify-center gap-6 sm:gap-10", className].join(" ")}
    >
      {partners.map((partner) => {
        const mark = (
          <BrandLogo src={partner.logo} alt={partner.alt} heightClassName={heightClassName} padding={padding} />
        );

        return (
          <div key={partner.name} className="flex flex-col items-center gap-2">
            {partner.href ? (
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md transition-opacity duration-fast hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-warm-gold"
              >
                {mark}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              mark
            )}
          </div>
        );
      })}
    </div>
  );
}
