/**
 * Registration wizard state model.
 *
 * The wizard is five steps (registration flow simplification phase — see
 * docs/phase-36-registration-flow-simplification-notes.md): 01 PARTICIPANT,
 * 02 EVENTS, 03 PACKAGE, 04 REVIEW, 05 PAYMENT. A sixth, "Registration
 * Complete," is the separate `/success` route, not a step in this wizard's
 * own progress indicator — it was never part of `REGISTRATION_STEPS`
 * before this phase either. This file is the shape of the state that
 * flows through those steps — see lib/registration/state.ts for the
 * reducer that mutates it and lib/registration/pricing.ts for how
 * `pricing` gets computed.
 *
 * This is a COLLEGE MEDICAL FEST registration website: ONE STUDENT = ONE
 * REGISTRATION. Every participant submits their own details, event
 * selections, and package — never a full team roster. AFFINITY '26 does
 * have team events, and a participant can still select one, but this
 * wizard does not collect who else is on that team; the organizer manages
 * team composition separately. A prior phase's "Details" step (team name +
 * captain + member roster per team event) has been removed entirely — see
 * the phase notes for why: neither a team name nor a member roster is a
 * sourced official requirement anywhere in docs/affinity-content-truth.md,
 * so collecting one was this wizard's own invented step, not a fact from
 * the source documents.
 *
 * FRONTEND-ONLY: nothing here calls a real backend. Confirmation produces
 * a mock registration record for the success/pass screen; payment is a
 * labeled placeholder, never a real transaction. See docs/frontend-audit.md.
 */

import type { PackageId } from "@/data/pricing";

export type YearOfStudy = "1" | "2" | "3" | "4" | "intern" | "pg";

export interface Participant {
  name: string;
  /**
   * Phase 29 (college dropdown): the selected college's id in
   * `data/colleges.ts`, or `null` when nothing has been chosen yet. This
   * is the field validation actually checks — a participant can only
   * reach this state by picking a real entry from `CollegeCombobox`, never
   * by typing arbitrary text, so a non-null `collegeId` is proof the
   * selection is one of the 86 official colleges.
   */
  collegeId: string | null;
  /**
   * The complete official name of the college `collegeId` points to,
   * kept alongside the id (rather than looked up fresh everywhere it's
   * displayed) so every existing reader of this field — `ReviewStep`,
   * `RegistrationSummary`, `RegistrationPass` — keeps working unchanged.
   * Always set together with `collegeId` by `CollegeCombobox`'s
   * `onSelect`; never partially typed text.
   */
  collegeName: string;
  yearOfStudy: YearOfStudy | null;
  phoneNumber: string;
  email: string;
}

export const EMPTY_PARTICIPANT: Participant = {
  name: "",
  collegeId: null,
  collegeName: "",
  yearOfStudy: null,
  phoneNumber: "",
  email: "",
};

/**
 * One event the participant has selected. This is the *individual*
 * registrant's own selection — never a team roster. A participant can
 * select a team/duo/squad event exactly like an individual one; this
 * wizard does not ask them to name teammates, a team name, or a captain
 * for it. A prior phase's "Details" step (`TeamMember`, `teamMembers`,
 * `teamName`, `captainId`) collected exactly that roster; it has been
 * removed entirely, per this file's top doc comment — see
 * docs/phase-36-registration-flow-simplification-notes.md.
 */
export interface EventSelection {
  eventId: string;
}

export interface PackageSelection {
  packageId: PackageId | null;
  /** Mirrors packageId === "registration-food-accommodation", kept explicit so the UI can offer it as its own toggle before the package is finalized. */
  accommodationRequested: boolean;
}

export const EMPTY_PACKAGE: PackageSelection = {
  packageId: null,
  accommodationRequested: false,
};

export type PricingLineKind = "package" | "event-fee" | "bundle" | "adjustment";

export interface PricingLine {
  label: string;
  amount: number;
  kind: PricingLineKind;
  /** e.g. which eventId this line came from, for traceability in the review step. */
  sourceEventId?: string;
}

export interface PricingSummary {
  lines: PricingLine[];
  total: number;
  currency: "INR";
  /**
   * Always true: docs/affinity-content-truth.md §5/§15 flags that the
   * brochure never states how the base package interacts with most
   * per-event fees, so any total this app computes is an estimate the
   * organizer must confirm, not a guaranteed final amount.
   */
  isEstimate: true;
  /** Human-readable caveats surfaced alongside the total (e.g. the §5/§14(c) ambiguities), so the UI never presents the estimate as more certain than the source data supports. */
  assumptions: string[];
}

export interface RegistrationReview {
  acceptedTerms: boolean;
  reviewedAt: string | null;
}

/** No real payment processing exists — see the PAYMENT section of the project brief. */
export type PaymentStatus = "not-started" | "demo-pending" | "demo-complete";

export interface ConfirmationDetails {
  /** Clearly a mock ID, not issued by any backend — format left to the UI layer (e.g. "AFF26-DEMO-XXXXXX"). */
  mockRegistrationId: string;
  generatedAt: string;
  paymentStatus: PaymentStatus;
}

/**
 * Registration flow simplification phase: the "details" step (team name +
 * captain + member roster) is gone — see this file's top doc comment and
 * `EventSelection`'s own doc comment. Five steps remain; "Registration
 * Complete" is the separate `/success` route, outside this list, exactly
 * as it was before this phase too.
 */
export const REGISTRATION_STEPS = [
  "participant",
  "events",
  "package",
  "review",
  "confirm",
] as const;

export type RegistrationStep = (typeof REGISTRATION_STEPS)[number];

/** Display metadata for one wizard step — number/label/description only, no logic. Superseding the old WizardNav's private STEP_LABELS (Phase 02) now that Phase 11 gives the wizard real step components. */
export interface StepMeta {
  number: string;
  label: string;
  description: string;
}

export const STEP_META: Record<RegistrationStep, StepMeta> = {
  participant: {
    number: "01",
    label: "Participant",
    description: "Enter your details to begin your AFFINITY '26 registration.",
  },
  events: {
    number: "02",
    label: "Events",
    description: "Choose the events you wish to participate in.",
  },
  package: {
    number: "03",
    label: "Package",
    description: "Select your AFFINITY '26 registration package.",
  },
  review: {
    number: "04",
    label: "Review",
    description: "Check every detail before proceeding to payment.",
  },
  confirm: {
    number: "05",
    label: "Payment",
    description: "Frontend demo — payment integration pending.",
  },
};

export interface RegistrationState {
  step: RegistrationStep;
  participant: Participant;
  selectedEvents: EventSelection[];
  package: PackageSelection;
  pricing: PricingSummary | null;
  review: RegistrationReview;
  confirmation: ConfirmationDetails | null;
}

export const INITIAL_REGISTRATION_STATE: RegistrationState = {
  step: "participant",
  participant: EMPTY_PARTICIPANT,
  selectedEvents: [],
  package: EMPTY_PACKAGE,
  pricing: null,
  review: { acceptedTerms: false, reviewedAt: null },
  confirmation: null,
};
