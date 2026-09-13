/**
 * Registration wizard state model.
 *
 * The wizard is six steps (per the project brief): 01 PARTICIPANT,
 * 02 EVENTS, 03 DETAILS, 04 PACKAGE, 05 REVIEW, 06 CONFIRM. This file is
 * the shape of the state that flows through those steps — see
 * lib/registration/state.ts for the reducer that mutates it and
 * lib/registration/pricing.ts for how `pricing` gets computed.
 *
 * FRONTEND-ONLY: nothing here calls a real backend. Confirmation produces
 * a mock registration record for the success/pass screen; payment is a
 * labeled placeholder, never a real transaction. See docs/frontend-audit.md.
 */

import type { PackageId } from "@/data/pricing";

export type YearOfStudy = "1" | "2" | "3" | "4" | "intern" | "pg";

export interface Participant {
  name: string;
  collegeName: string;
  yearOfStudy: YearOfStudy | null;
  phoneNumber: string;
  email: string;
}

export const EMPTY_PARTICIPANT: Participant = {
  name: "",
  collegeName: "",
  yearOfStudy: null,
  phoneNumber: "",
  email: "",
};

export interface TeamMember {
  id: string;
  name: string;
  yearOfStudy?: YearOfStudy;
  /** Most team events require every member to be from the same college as the registrant — captured per-member in case an event's rules differ. */
  collegeName?: string;
}

/** One event the participant has selected, plus any team roster it needs. */
export interface EventSelection {
  eventId: string;
  /** Populated for team/duo/squad events; left empty for individual events. */
  teamMembers: TeamMember[];
  /**
   * Phase 14 (Details step). Team-events-only fields — a display name for
   * the roster and which member is captain. Neither is a sourced official
   * fact (no brochure section requires a named "team name" or "captain");
   * both are this wizard's own way of structuring the roster it collects,
   * the same kind of UX judgment call `lib/registration/validation.ts`
   * documents for its own required-field rules. `captainId` references a
   * `TeamMember.id` in `teamMembers`, or `null` when none is chosen yet
   * (including right after the captain's own entry was removed — the
   * reducer clears this rather than leaving it pointing at a member that
   * no longer exists).
   */
  teamName?: string;
  captainId?: string | null;
  notes?: string;
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

export const REGISTRATION_STEPS = [
  "participant",
  "events",
  "details",
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
    description: "Tell us who is entering the registry.",
  },
  events: {
    number: "02",
    label: "Events",
    description: "Choose the arenas you wish to compete in.",
  },
  details: {
    number: "03",
    label: "Details",
    description: "Team rosters for the events that need one.",
  },
  package: {
    number: "04",
    label: "Package",
    description: "Select a registration package.",
  },
  review: {
    number: "05",
    label: "Review",
    description: "Check every detail before confirming.",
  },
  confirm: {
    number: "06",
    label: "Confirm",
    description: "Frontend demo — payment integration pending.",
  },
};

export interface RegistrationState {
  step: RegistrationStep;
  participant: Participant;
  selectedEvents: EventSelection[];
  /** Convenience lookup mirroring selectedEvents, keyed by eventId — some UI (e.g. a details-step form list) is easier to write against a map. Kept in sync by the reducer, never mutated directly. */
  teamDetails: Record<string, TeamMember[]>;
  package: PackageSelection;
  pricing: PricingSummary | null;
  review: RegistrationReview;
  confirmation: ConfirmationDetails | null;
}

export const INITIAL_REGISTRATION_STATE: RegistrationState = {
  step: "participant",
  participant: EMPTY_PARTICIPANT,
  selectedEvents: [],
  teamDetails: {},
  package: EMPTY_PACKAGE,
  pricing: null,
  review: { acceptedTerms: false, reviewedAt: null },
  confirmation: null,
};
