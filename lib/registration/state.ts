/**
 * Registration wizard reducer.
 *
 * Pure state transitions only — no side effects, no network calls.
 * Persistence (lib/registration/storage.ts) and React wiring
 * (lib/registration/context.tsx) are kept separate so this file can be
 * unit-tested in isolation later.
 */
import type {
  RegistrationState,
  RegistrationStep,
  Participant,
  EventSelection,
} from "@/types/registration";
import { INITIAL_REGISTRATION_STATE } from "@/types/registration";
import type { PackageId } from "@/data/pricing";
import { getEventById } from "@/data/events";
import { calculatePricing } from "./pricing";

export type RegistrationAction =
  | { type: "SET_STEP"; step: RegistrationStep }
  | { type: "UPDATE_PARTICIPANT"; patch: Partial<Participant> }
  | { type: "SELECT_EVENT"; eventId: string }
  | { type: "DESELECT_EVENT"; eventId: string }
  | { type: "SET_PACKAGE"; packageId: PackageId }
  | { type: "SET_ACCOMMODATION_REQUESTED"; requested: boolean }
  | { type: "SET_ACCEPTED_TERMS"; accepted: boolean }
  | { type: "CONFIRM_REGISTRATION" }
  | { type: "RESET" }
  | { type: "HYDRATE"; state: RegistrationState };

function withRecalculatedPricing(state: RegistrationState): RegistrationState {
  return { ...state, pricing: calculatePricing(state) };
}

/**
 * Clearly a mock ID — no backend issues this. Format is a placeholder for
 * the success/pass screen (Phase 03+), not a real registration record.
 */
function generateMockRegistrationId(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AFF26-DEMO-${random}`;
}

export function registrationReducer(
  state: RegistrationState,
  action: RegistrationAction,
): RegistrationState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };

    case "UPDATE_PARTICIPANT":
      return { ...state, participant: { ...state.participant, ...action.patch } };

    case "SELECT_EVENT": {
      if (state.selectedEvents.some((selection) => selection.eventId === action.eventId)) {
        return state;
      }
      const selection: EventSelection = { eventId: action.eventId };
      return withRecalculatedPricing({
        ...state,
        selectedEvents: [...state.selectedEvents, selection],
      });
    }

    case "DESELECT_EVENT": {
      return withRecalculatedPricing({
        ...state,
        selectedEvents: state.selectedEvents.filter((selection) => selection.eventId !== action.eventId),
      });
    }

    case "SET_PACKAGE":
      return withRecalculatedPricing({
        ...state,
        package: {
          packageId: action.packageId,
          accommodationRequested: action.packageId === "registration-food-accommodation",
        },
      });

    case "SET_ACCOMMODATION_REQUESTED":
      return {
        ...state,
        package: { ...state.package, accommodationRequested: action.requested },
      };

    case "SET_ACCEPTED_TERMS":
      return {
        ...state,
        review: {
          acceptedTerms: action.accepted,
          reviewedAt: action.accepted ? new Date().toISOString() : null,
        },
      };

    case "CONFIRM_REGISTRATION":
      // Phase 17: this action now only fires from ConfirmStep's own
      // "Simulate Successful Payment (Demo)" button, at the end of the
      // two-phase demo-payment flow — so by the time it dispatches, the
      // (simulated) demo payment has already "succeeded" from the
      // participant's point of view. "demo-complete" reflects that;
      // "demo-pending" (Phase 02's original value, back when this action
      // fired straight off Confirm's single button with no payment step
      // at all) would now read as if something were still outstanding.
      return {
        ...state,
        step: "confirm",
        confirmation: {
          mockRegistrationId: generateMockRegistrationId(),
          generatedAt: new Date().toISOString(),
          paymentStatus: "demo-complete",
        },
      };

    case "RESET":
      return INITIAL_REGISTRATION_STATE;

    case "HYDRATE": {
      // Phase 39 (remove Online Events completely): a registration begun
      // before this phase could have persisted a `selectedEvents` entry
      // for one of the 9 online-cultural events this phase excluded from
      // `allEvents` (data/events/index.ts) — that id no longer resolves
      // via `getEventById`. Every step component that *renders*
      // `selectedEvents` already maps through `getEventById` and drops
      // unresolvable ids (EventsStep/ReviewStep/RegistrationSummary/
      // RegistrationPass), so a stale id was never going to crash
      // anything — but it would otherwise sit in `state.selectedEvents`
      // (and get re-persisted to localStorage) forever, silently invalid.
      // The phase brief is explicit that a stale online event must be
      // "removed safely from the active registration selection," not just
      // hidden from view, so hydration is where that actually happens —
      // once, here, rather than duplicating the same filter in every
      // consumer. `withRecalculatedPricing` is a no-op either way (see
      // ./pricing.ts — the total only ever depends on the selected
      // package, never on which events are selected).
      const hydrated = action.state;
      const sanitizedSelectedEvents = hydrated.selectedEvents.filter((selection) =>
        Boolean(getEventById(selection.eventId)),
      );
      return withRecalculatedPricing({
        ...hydrated,
        selectedEvents: sanitizedSelectedEvents,
      });
    }

    default:
      return state;
  }
}
