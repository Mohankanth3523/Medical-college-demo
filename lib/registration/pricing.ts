/**
 * Frontend-only pricing calculation.
 *
 * Pure function: (RegistrationState) -> PricingSummary. No network calls —
 * this is exactly the "Frontend pricing calculation" the project brief
 * asks for, reading only data/pricing.ts and data/events/*.
 *
 * Every total this produces is explicitly an estimate (`isEstimate: true`)
 * with human-readable `assumptions`, because docs/affinity-content-truth.md
 * §5/§15 documents that the source brochure never states how the base
 * package interacts with most per-event fees. Silently guessing a number
 * here would violate the project's truth-mode rule just as much as
 * inventing a fact in a data file would.
 *
 * Phase 15 decomposed the single "package" line into Base Registration /
 * Food / Accommodation, per the brief's own "Display: Base registration,
 * Event-specific fees, Food, Accommodation, Total". See the comments below
 * for exactly how — the short version: every number here is either lifted
 * straight from `PACKAGES` (data/pricing.ts, itself transcribed from the
 * brochure's pricing page) or an exact arithmetic difference between two
 * of those numbers, never a guessed split.
 */
import type { RegistrationState } from "@/types/registration";
import type { PricingLine, PricingSummary } from "@/types/registration";
import { getEventById } from "@/data/events";
import { PACKAGES, baseIncludesUnlistedEvents } from "@/data/pricing";

export function calculatePricing(state: RegistrationState): PricingSummary {
  const lines: PricingLine[] = [];
  const assumptions: string[] = [];

  const baseOption = PACKAGES.find((option) => option.id === "registration-only");
  const foodOption = PACKAGES.find((option) => option.id === "registration-food");
  const accommodationOption = PACKAGES.find((option) => option.id === "registration-food-accommodation");

  const selectedPackage = state.package.packageId
    ? PACKAGES.find((option) => option.id === state.package.packageId)
    : undefined;

  /**
   * Chess-only special case. `data/events/sports.ts`'s own Chess record
   * carries this in its `fee.notes` (sourced from
   * docs/affinity-content-truth.md §5): a participant whose *only*
   * selected event is Chess pays a flat ₹250 that — in the brochure's own
   * words — "replaces the general package", not an amount added on top of
   * the ₹480/1,100/1,500 base. This is the one place the calculator reads
   * an event's fee as a structural pricing rule rather than just a display
   * number; it's scoped tightly (a lone Chess selection, checked by id,
   * nothing inferred for any other event) so it can't accidentally apply
   * anywhere else.
   */
  const isChessOnly = state.selectedEvents.length === 1 && state.selectedEvents[0]?.eventId === "chess";

  if (isChessOnly) {
    assumptions.push(
      '"Chess only" registration: the official ₹250 Chess fee replaces the base registration package rather than adding to it. If Food and/or Accommodation is also selected below, those amounts are added on top of ₹250 (not ₹480) — the brochure prices Chess-only entry and the Food/Accommodation add-ons separately and never states this exact combination, so that part of the total is an estimate. [VERIFY WITH ORGANIZER]',
    );
  } else if (selectedPackage && baseOption) {
    lines.push({ label: "Base Registration", amount: baseOption.amount, kind: "package" });
  }

  // Food and Accommodation are exact arithmetic differences between
  // adjacent official package tiers — e.g. "Food" = (Registration + Food)
  // − (Registration only) = ₹1,100 − ₹480 = ₹620. The three tier totals
  // (₹480/₹1,100/₹1,500) are themselves the only numbers the brochure
  // states; their pairwise differences are an exact, unambiguous
  // decomposition of those stated numbers (the package *names* say each
  // tier is the previous one plus one more thing), not an invented split.
  if (selectedPackage?.includesFood && foodOption && baseOption) {
    lines.push({ label: "Food", amount: foodOption.amount - baseOption.amount, kind: "package" });
  }
  if (selectedPackage?.includesAccommodation && accommodationOption && foodOption) {
    lines.push({
      label: "Accommodation",
      amount: accommodationOption.amount - foodOption.amount,
      kind: "package",
    });
  }

  for (const selection of state.selectedEvents) {
    const event = getEventById(selection.eventId);
    if (!event) continue;

    if (event.fee.amount == null) {
      assumptions.push(
        event.fee.unit === "included_in_package"
          ? `${event.name}: assumed included in the base registration package (unconfirmed by the organizer). [VERIFY WITH ORGANIZER]`
          : `${event.name}: no fee is stated in the source materials; not added to this estimate.`,
      );
      continue;
    }

    let amount = event.fee.amount;
    let label = `${event.name} fee`;
    if (event.fee.unit === "per_person" && selection.teamMembers.length > 1) {
      amount = event.fee.amount * selection.teamMembers.length;
      label = `${event.name} fee (${selection.teamMembers.length} participants)`;
    }

    lines.push({ label, amount, kind: "event-fee", sourceEventId: event.id });
  }

  if (!baseIncludesUnlistedEvents.confirmed && !isChessOnly) {
    assumptions.push(`${baseIncludesUnlistedEvents.note} [VERIFY WITH ORGANIZER]`);
  }

  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  return {
    lines,
    total,
    currency: "INR",
    isEstimate: true,
    assumptions,
  };
}
