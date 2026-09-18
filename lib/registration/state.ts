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

    case "HYDRATE":
      return action.state;

    default:
      return state;
  }
}
