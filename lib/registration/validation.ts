/**
 * Registration wizard field validation.
 *
 * Pure functions only — no DOM/React here, so this can be unit-tested and
 * reused from both `ParticipantStep` (inline errors) and
 * `RegistrationNavigation` (gating "Next") without either importing the
 * other. Validation *rules themselves* (required-ness, length limits,
 * phone/email shape) are ordinary frontend UX judgment calls, not sourced
 * facts — the project brief's TRUTH MODE governs event names/fees/dates/
 * etc., not "is this a plausible phone number." Where a rule *is* sourced
 * (which year-of-study options exist), it comes from `types/registration.ts`
 * / `data/registrationVerification.ts`, not invented here.
 */
import type { EventSelection, Participant, PackageSelection, RegistrationReview } from "@/types/registration";
import type { TeamComposition } from "@/types/event";
import { getEventById } from "@/data/events";

export type ParticipantErrors = Partial<Record<keyof Participant, string>>;

const NAME_MIN = 2;
const NAME_MAX = 80;
const COLLEGE_MIN = 2;
const COLLEGE_MAX = 120;
const EMAIL_MAX = 254;

/** 10-digit Indian mobile number, optionally prefixed with +91/91/0, optional spaces/hyphens — stripped before testing. */
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

/** Deliberately simple (not the full RFC 5322 grammar) — good enough to catch obvious typos without rejecting valid real-world addresses. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(raw: string): string {
  const stripped = raw.replace(/[\s-]/g, "");
  return stripped.replace(/^(\+91|91|0)/, "");
}

export function validateParticipant(participant: Participant): ParticipantErrors {
  const errors: ParticipantErrors = {};

  const name = participant.name.trim();
  if (!name) {
    errors.name = "Enter your full name.";
  } else if (name.length < NAME_MIN) {
    errors.name = `Name must be at least ${NAME_MIN} characters.`;
  } else if (name.length > NAME_MAX) {
    errors.name = `Name must be under ${NAME_MAX} characters.`;
  }

  const collegeName = participant.collegeName.trim();
  if (!collegeName) {
    errors.collegeName = "Enter your college name.";
  } else if (collegeName.length < COLLEGE_MIN) {
    errors.collegeName = `College name must be at least ${COLLEGE_MIN} characters.`;
  } else if (collegeName.length > COLLEGE_MAX) {
    errors.collegeName = `College name must be under ${COLLEGE_MAX} characters.`;
  }

  if (!participant.yearOfStudy) {
    errors.yearOfStudy = "Select your year of study.";
  }

  const phone = participant.phoneNumber.trim();
  if (!phone) {
    errors.phoneNumber = "Enter your phone number.";
  } else if (!INDIAN_MOBILE_REGEX.test(normalizePhone(phone))) {
    errors.phoneNumber = "Enter a valid 10-digit Indian mobile number.";
  }

  const email = participant.email.trim();
  if (!email) {
    errors.email = "Enter your email address.";
  } else if (email.length > EMAIL_MAX) {
    errors.email = "Email address is too long.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

export function isParticipantValid(participant: Participant): boolean {
  return Object.keys(validateParticipant(participant)).length === 0;
}

/**
 * Step 02 — Events. "Valid" here means only "at least one event is
 * selected" — the phase brief's own "Continue disabled if no valid event
 * selected" plus "Do not invent restrictions" together rule out adding
 * any eligibility-matching logic (e.g. cross-checking a participant's
 * year of study against an event's `eligibility` text) that the source
 * material doesn't already enforce as a hard, structured rule. Every
 * event in `data/events/*` is a real, selectable AFFINITY '26 event, so
 * selecting any one of them is "valid" — there is nothing else to check.
 */
export function isEventsStepValid(selectedEvents: EventSelection[]): boolean {
  return selectedEvents.length > 0;
}

const TEAM_NAME_MIN = 2;
const TEAM_NAME_MAX = 60;
const MEMBER_NAME_MIN = 2;
const MEMBER_NAME_MAX = 80;

export interface TeamSelectionErrors {
  teamName?: string;
  /** Roster-size (or "add at least one member") error — not tied to one specific input, so shown as a section-level message rather than under a single field. */
  size?: string;
  captain?: string;
  /** Keyed by `TeamMember.id`. */
  members: Record<string, string>;
}

/**
 * Step 03 — Details. Validates one team event's roster against its own
 * `TeamComposition` (`event.team`, `types/event.ts`) — the *only* place
 * team-size bounds come from. Several real AFFINITY '26 team events have
 * no `team.min`/`team.max` at all (e.g. Short Film, Carrom — see
 * `docs/phase-14-details-step-notes.md`), and the phase brief is explicit:
 * "If the source does not specify a team size: do not invent it." So a
 * missing bound here means *no size error is ever produced for that
 * bound* — never a guessed default. The one exception is a bare "add at
 * least one member" floor when the roster is empty, which isn't a
 * numeric fact from the brochure at all — a team of zero people isn't a
 * team, independent of what the source states about the upper bound.
 *
 * `teamName` and `captainId` are this wizard's own fields (see their doc
 * comments in `types/registration.ts`), so their required-ness is an
 * ordinary UX rule, the same class of judgment call as
 * `validateParticipant`'s length limits — not a sourced fact either.
 */
export function validateTeamSelection(
  team: TeamComposition | undefined,
  selection: EventSelection,
): TeamSelectionErrors {
  const errors: TeamSelectionErrors = { members: {} };

  const teamName = (selection.teamName ?? "").trim();
  if (!teamName) {
    errors.teamName = "Enter a team name.";
  } else if (teamName.length < TEAM_NAME_MIN) {
    errors.teamName = `Team name must be at least ${TEAM_NAME_MIN} characters.`;
  } else if (teamName.length > TEAM_NAME_MAX) {
    errors.teamName = `Team name must be under ${TEAM_NAME_MAX} characters.`;
  }

  const members = selection.teamMembers;
  const count = members.length;
  const min = team?.min;
  const max = team?.max;

  if (count === 0) {
    errors.size = "Add at least one team member.";
  } else if (min != null && max != null) {
    if (min === max && count !== min) {
      errors.size = `Team size must be exactly ${min} members (currently ${count}).`;
    } else if (count < min || count > max) {
      errors.size = `Team size must be between ${min} and ${max} members (currently ${count}).`;
    }
  } else if (max != null && count > max) {
    errors.size = `Team size must be at most ${max} members (currently ${count}).`;
  } else if (min != null && count < min) {
    errors.size = `Team size must be at least ${min} members (currently ${count}).`;
  }
  // else: the source doesn't state a bound on this side — nothing to enforce.

  if (count > 0 && (!selection.captainId || !members.some((m) => m.id === selection.captainId))) {
    errors.captain = "Select a team captain.";
  }

  const seenNames = new Map<string, string>();
  for (const member of members) {
    const name = member.name.trim();
    if (!name) {
      errors.members[member.id] = "Enter this member's name.";
      continue;
    }
    if (name.length < MEMBER_NAME_MIN) {
      errors.members[member.id] = `Name must be at least ${MEMBER_NAME_MIN} characters.`;
      continue;
    }
    if (name.length > MEMBER_NAME_MAX) {
      errors.members[member.id] = `Name must be under ${MEMBER_NAME_MAX} characters.`;
      continue;
    }
    const normalized = name.toLowerCase();
    if (seenNames.has(normalized)) {
      errors.members[member.id] = "This name is already in the team.";
    } else {
      seenNames.set(normalized, member.id);
    }
  }

  return errors;
}

export function isTeamSelectionValid(team: TeamComposition | undefined, selection: EventSelection): boolean {
  const errors = validateTeamSelection(team, selection);
  return !errors.teamName && !errors.size && !errors.captain && Object.keys(errors.members).length === 0;
}

/**
 * Step 03 as a whole. Individual events need no roster and are always
 * valid; every non-individual selected event must pass
 * `isTeamSelectionValid`. An event that has somehow gone missing from
 * `data/events/*` (should never happen — `EventPreselect`/`EventsStep`
 * only ever select real ids) is treated as valid rather than silently
 * blocking the wizard on a data-integrity bug this step can't fix.
 */
export function isDetailsStepValid(selectedEvents: EventSelection[]): boolean {
  return selectedEvents.every((selection) => {
    const event = getEventById(selection.eventId);
    if (!event || event.type === "individual") return true;
    return isTeamSelectionValid(event.team, selection);
  });
}

/**
 * Step 04 — Package. Like `isEventsStepValid`, "valid" means only "a
 * package has been chosen" — a simple boolean gate, not a form with
 * per-field errors. The three packages themselves (and their prices) are
 * the officially stated ones in `data/pricing.ts`; there is nothing else
 * to validate about which one was picked.
 */
export function isPackageStepValid(packageSelection: PackageSelection): boolean {
  return packageSelection.packageId !== null;
}

/**
 * Step 05 — Review. The only thing gating "Proceed" is the acknowledgement
 * checkbox itself (`RegistrationReview.acceptedTerms`) — every other field
 * was already validated on its own step (Participant/Details) or needs no
 * validation at all (Events/Package are simple selections). Re-checking
 * those here would duplicate `isParticipantValid`/`isDetailsStepValid`/
 * `isEventsStepValid`/`isPackageStepValid` for no UX benefit, since a user
 * can't reach Review through the wizard's own "Next" flow without already
 * having passed them — they're each still independently enforced on their
 * own step regardless of how Review is reached (e.g. jumping via the
 * freely-clickable step indicator).
 */
export function isReviewStepValid(review: RegistrationReview): boolean {
  return review.acceptedTerms;
}
