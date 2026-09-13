"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRegistration } from "@/lib/registration/context";
import { getEventById } from "@/data/events";
import { formatEventFee } from "@/lib/events/formatFee";
import { validateTeamSelection, type TeamSelectionErrors } from "@/lib/registration/validation";
import { OrnamentalFrame } from "@/components/design-system";
import { REGISTRATION_STEPS } from "@/types/registration";
import type { TeamMember, EventSelection } from "@/types/registration";
import type { AffinityEvent, TeamComposition } from "@/types/event";

function makeMemberId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `member-${Math.random().toString(36).slice(2, 10)}`;
}

/** "Team size: 7–12" / "up to 12" / "exactly 15" / "at least 5" / the honest fallback when the source states no bound at all — see validateTeamSelection's doc comment for why a missing bound is never guessed. */
function teamSizeLabel(team: TeamComposition | undefined): string {
  const { min, max } = team ?? {};
  if (min == null && max == null) return "Team size not specified by the organizer";
  if (min != null && max != null) {
    return min === max ? `Team size: exactly ${min}` : `Team size: ${min}–${max}`;
  }
  if (max != null) return `Team size: up to ${max}`;
  return `Team size: at least ${min}`;
}

function CheckGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-antique-gold">
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 10.2 L8.7 13 L14 7.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrownGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 12" className="h-3 w-3 shrink-0">
      <path d="M1 10.5 L1 5 L4.3 7.5 L8 2 L11.7 7.5 L15 5 L15 10.5 Z" fill="currentColor" />
    </svg>
  );
}

function RemoveGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
      <line x1="1.5" y1="1.5" x2="10.5" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.5" y1="1.5" x2="1.5" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const LABEL_CLASS = "font-body text-xs font-medium uppercase tracking-wide text-desert-sand";

const INPUT_CLASS =
  "mt-1.5 min-h-11 w-full border bg-royal-navy/60 px-4 py-2 font-body text-sm text-ivory placeholder:text-desert-sand/50 transition-colors duration-base focus:outline-none focus:ring-2 focus:ring-warm-gold";

function borderClass(hasError: boolean): string {
  return hasError ? "border-error-rose" : "border-antique-gold/40";
}

interface ResolvedSelection {
  event: AffinityEvent;
  selection: EventSelection;
}

/**
 * Step 03 — "Assemble Your Company". For every selected individual event,
 * a plain confirmation line (no roster to collect). For every selected
 * team/duo/squad event, a real roster: Team Name, a Captain chosen from
 * the roster (a radio group, not a separate person to type in twice —
 * see `docs/phase-14-details-step-notes.md`), and Team Members with
 * add/remove, min/max validation sourced from `event.team`, required-name
 * checks, and same-team duplicate-name detection.
 *
 * Like `ParticipantStep`, "Next" is associated with this step's own
 * `<form id="details-form">` via the native HTML `form` attribute
 * (`RegistrationNavigation`'s `FORM_ID_BY_STEP`) — errors reveal and
 * focus moves to the first invalid field only after a failed attempt to
 * advance, not on every keystroke. Unlike `ParticipantStep`, there is no
 * per-field blur-triggered reveal: with a dynamic, repeating set of team
 * sections and members, tracking "touched" per dynamically-created
 * member would add real complexity for little benefit over the simpler
 * "reveal everything once, then live-update as it's fixed" approach used
 * here (the same pattern `EventsStep`'s simpler gate already uses).
 */
export function DetailsStep() {
  const { state, dispatch } = useRegistration();
  const [attempted, setAttempted] = useState(false);

  const teamNameRefs = useRef(new Map<string, HTMLInputElement>());
  const memberRefs = useRef(new Map<string, HTMLInputElement>());
  const sectionRefs = useRef(new Map<string, HTMLDivElement>());

  const resolved = useMemo<ResolvedSelection[]>(
    () =>
      state.selectedEvents
        .map((selection) => ({ selection, event: getEventById(selection.eventId) }))
        .filter((entry): entry is ResolvedSelection => Boolean(entry.event)),
    [state.selectedEvents],
  );

  const individualSelections = useMemo(
    () => resolved.filter(({ event }) => event.type === "individual"),
    [resolved],
  );
  const teamSelections = useMemo(
    () => resolved.filter(({ event }) => event.type !== "individual"),
    [resolved],
  );

  const errorsByEvent = useMemo(() => {
    const map = new Map<string, TeamSelectionErrors>();
    teamSelections.forEach(({ event, selection }) => {
      map.set(event.id, validateTeamSelection(event.team, selection));
    });
    return map;
  }, [teamSelections]);

  function addMember(eventId: string, current: TeamMember[]) {
    dispatch({
      type: "SET_TEAM_MEMBERS",
      eventId,
      members: [...current, { id: makeMemberId(), name: "" }],
    });
  }

  function updateMemberName(eventId: string, current: TeamMember[], memberId: string, name: string) {
    dispatch({
      type: "SET_TEAM_MEMBERS",
      eventId,
      members: current.map((m) => (m.id === memberId ? { ...m, name } : m)),
    });
  }

  function removeMember(eventId: string, current: TeamMember[], memberId: string) {
    dispatch({
      type: "SET_TEAM_MEMBERS",
      eventId,
      members: current.filter((m) => m.id !== memberId),
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const invalidEntry = teamSelections.find(({ event: ev }) => {
      const errs = errorsByEvent.get(ev.id);
      return Boolean(errs && (errs.teamName || errs.size || errs.captain || Object.keys(errs.members).length > 0));
    });

    if (invalidEntry) {
      setAttempted(true);
      const errs = errorsByEvent.get(invalidEntry.event.id);
      if (errs?.teamName) {
        teamNameRefs.current.get(invalidEntry.event.id)?.focus();
      } else {
        const firstMemberErrorId = errs ? Object.keys(errs.members)[0] : undefined;
        if (firstMemberErrorId) {
          memberRefs.current.get(`${invalidEntry.event.id}:${firstMemberErrorId}`)?.focus();
        } else {
          sectionRefs.current.get(invalidEntry.event.id)?.focus();
        }
      }
      return;
    }

    const nextStep = REGISTRATION_STEPS[REGISTRATION_STEPS.indexOf("details") + 1];
    if (nextStep) dispatch({ type: "SET_STEP", step: nextStep });
  }

  return (
    <form id="details-form" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-2xl font-semibold tracking-wide text-ivory">Assemble Your Company</h3>
        <p className="font-accent text-base italic text-warm-gold">
          Gather your companions for the tales ahead.
        </p>
      </div>

      {individualSelections.length > 0 && (
        <div className="mt-6">
          <h4 className={LABEL_CLASS}>Individual Entries</h4>
          <ul className="mt-3 flex flex-col gap-2">
            {individualSelections.map(({ event }) => (
              <li
                key={event.id}
                className="flex items-center gap-3 border border-antique-gold/20 px-4 py-3"
              >
                <CheckGlyph />
                <div className="flex flex-col">
                  <span className="font-body text-sm font-medium text-ivory">{event.name}</span>
                  <span className="font-body text-xs text-desert-sand">
                    Individual entry &middot; {formatEventFee(event.fee)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {teamSelections.length > 0 && (
        <div className="mt-8 flex flex-col gap-8">
          {teamSelections.map(({ event, selection }) => {
            const errs = errorsByEvent.get(event.id) ?? { members: {} };
            const showSectionErrors = attempted && (errs.teamName || errs.size || errs.captain);
            const atMax = event.team?.max != null && selection.teamMembers.length >= event.team.max;

            return (
              <div
                key={event.id}
                ref={(el) => {
                  if (el) sectionRefs.current.set(event.id, el);
                  else sectionRefs.current.delete(event.id);
                }}
                tabIndex={-1}
                className="focus:outline-none"
              >
                <OrnamentalFrame padding="sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-display text-lg font-semibold text-ivory">{event.name}</h4>
                    <span className="font-body text-xs text-desert-sand">{teamSizeLabel(event.team)}</span>
                  </div>

                  {showSectionErrors && (
                    <div role="alert" className="mt-3 flex flex-col gap-1 border border-error-rose/40 px-3 py-2">
                      {errs.teamName && <p className="font-body text-xs text-error-rose">{errs.teamName}</p>}
                      {errs.size && <p className="font-body text-xs text-error-rose">{errs.size}</p>}
                      {errs.captain && <p className="font-body text-xs text-error-rose">{errs.captain}</p>}
                    </div>
                  )}

                  <div className="mt-4">
                    <label htmlFor={`team-name-${event.id}`} className={LABEL_CLASS}>
                      Team Name <span aria-hidden="true" className="text-error-rose">*</span>
                    </label>
                    <input
                      id={`team-name-${event.id}`}
                      ref={(el) => {
                        if (el) teamNameRefs.current.set(event.id, el);
                        else teamNameRefs.current.delete(event.id);
                      }}
                      type="text"
                      value={selection.teamName ?? ""}
                      onChange={(e) =>
                        dispatch({ type: "SET_TEAM_NAME", eventId: event.id, teamName: e.target.value })
                      }
                      aria-required="true"
                      aria-invalid={(attempted && Boolean(errs.teamName)) || undefined}
                      aria-describedby={attempted && errs.teamName ? `team-name-${event.id}-error` : undefined}
                      className={`${INPUT_CLASS} ${borderClass(attempted && Boolean(errs.teamName))}`}
                    />
                    {attempted && errs.teamName && (
                      <p
                        id={`team-name-${event.id}-error`}
                        role="alert"
                        className="mt-1.5 font-body text-xs text-error-rose"
                      >
                        {errs.teamName}
                      </p>
                    )}
                  </div>

                  <fieldset className="mt-5">
                    <legend className={LABEL_CLASS}>
                      Team Members ({selection.teamMembers.length})
                    </legend>

                    <div
                      role="radiogroup"
                      aria-label={`Captain for ${event.name}`}
                      className="mt-2 flex flex-col gap-2"
                    >
                      {selection.teamMembers.map((member) => {
                        const isCaptain = selection.captainId === member.id;
                        const memberError = attempted ? errs.members[member.id] : undefined;

                        return (
                          <div
                            key={member.id}
                            className={[
                              "flex flex-wrap items-center gap-2 border px-3 py-2 transition-colors duration-base",
                              isCaptain ? "border-antique-gold bg-antique-gold/10" : "border-antique-gold/20",
                            ].join(" ")}
                          >
                            <label className="inline-flex min-h-11 min-w-11 items-center justify-center">
                              <span className="sr-only">Make {member.name || "this member"} the captain</span>
                              <input
                                type="radio"
                                name={`captain-${event.id}`}
                                checked={isCaptain}
                                onChange={() =>
                                  dispatch({ type: "SET_CAPTAIN", eventId: event.id, memberId: member.id })
                                }
                                className="h-4 w-4 accent-antique-gold"
                              />
                            </label>

                            <div className="min-w-[8rem] flex-1">
                              <label htmlFor={`member-${event.id}-${member.id}`} className="sr-only">
                                Member name
                              </label>
                              <input
                                id={`member-${event.id}-${member.id}`}
                                ref={(el) => {
                                  const key = `${event.id}:${member.id}`;
                                  if (el) memberRefs.current.set(key, el);
                                  else memberRefs.current.delete(key);
                                }}
                                type="text"
                                placeholder="Member name"
                                value={member.name}
                                onChange={(e) =>
                                  updateMemberName(event.id, selection.teamMembers, member.id, e.target.value)
                                }
                                aria-required="true"
                                aria-invalid={Boolean(memberError) || undefined}
                                aria-describedby={
                                  memberError ? `member-${event.id}-${member.id}-error` : undefined
                                }
                                className={`min-h-11 w-full border bg-royal-navy/60 px-3 py-1.5 font-body text-sm text-ivory placeholder:text-desert-sand/50 transition-colors duration-base focus:outline-none focus:ring-2 focus:ring-warm-gold ${borderClass(Boolean(memberError))}`}
                              />
                              {memberError && (
                                <p
                                  id={`member-${event.id}-${member.id}-error`}
                                  role="alert"
                                  className="mt-1 font-body text-xs text-error-rose"
                                >
                                  {memberError}
                                </p>
                              )}
                            </div>

                            {isCaptain && (
                              <span className="inline-flex items-center gap-1 border border-antique-gold px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wide text-antique-gold">
                                <CrownGlyph />
                                Captain
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => removeMember(event.id, selection.teamMembers, member.id)}
                              aria-label={`Remove ${member.name || "this member"}`}
                              className="inline-flex min-h-11 min-w-11 items-center justify-center border border-antique-gold/30 px-2 text-desert-sand transition-colors duration-fast hover:border-error-rose/60 hover:text-error-rose"
                            >
                              <RemoveGlyph />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => addMember(event.id, selection.teamMembers)}
                      disabled={atMax}
                      className="mt-3 inline-flex min-h-11 items-center gap-1.5 border border-antique-gold/40 px-4 py-2 font-body text-sm font-medium uppercase tracking-wide text-antique-gold transition-colors duration-fast hover:border-warm-gold hover:text-warm-gold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      + Add Member
                    </button>
                  </fieldset>
                </OrnamentalFrame>
              </div>
            );
          })}
        </div>
      )}
    </form>
  );
}
