# AFFINITY '26 — Backend Integration Map

**Scope:** documentation only, no code. This is one of the four docs the
project brief's DOCUMENTATION section asks every phase to maintain
(`frontend-audit.md`, `affinity-content-truth.md`,
`frontend-content-audit.md`, `backend-integration-map.md`). Written
alongside Phase 11 (Registration System UI) because that phase's brief
explicitly asked for the wizard to be "easy to connect to a future API" —
this document is how that requirement is satisfied, rather than adding a
speculative API-client abstraction into the reducer itself (see
`docs/phase-11-registration-architecture-notes.md` for why that would have
been scope creep this phase).

This frontend has **no backend of any kind** — no API routes, no
database, no auth, no payment gateway, no email/WhatsApp automation. Every
mock in the codebase is clearly labelled as a mock (see
`docs/frontend-audit.md` §9 and `docs/affinity-content-truth.md`). This
document exists so a future backend engineer — or a future phase of this
same project — knows exactly where the seams are.

## How to read this table

Each row is one point where frontend-only mock behaviour would, in a real
system, cross a network boundary. "Current (frontend-only)" describes
what exists today; "Future integration point" describes the shape of the
change, not a committed API design — none of this has been built or even
scaffolded.

| Concern | Current (frontend-only) | Future integration point |
|---|---|---|
| Registration draft persistence | `lib/registration/storage.ts` — `localStorage`, key `affinity26.registration.v1`, read/written by `RegistrationProvider` (`lib/registration/context.tsx`) on every state change | A `PATCH /api/registrations/:draftId` (or similar) called from the same `useEffect` that currently calls `saveRegistrationState`, with `localStorage` kept as an offline-first cache/fallback rather than removed outright |
| Registration submission | `CONFIRM_REGISTRATION` action in `lib/registration/state.ts` — synchronously generates a mock ID (`generateMockRegistrationId()`) and sets `paymentStatus: "demo-pending"` | A `POST /api/registrations` call, dispatched from wherever `CONFIRM_REGISTRATION` is currently triggered (`ConfirmStep.tsx`), replacing the synchronous mock-ID generation with the ID the backend actually issues |
| Registration ID | `AFF26-DEMO-XXXXXX` — random, client-generated, never meant to look like a real ID (see `types/registration.ts` `ConfirmationDetails.mockRegistrationId`) | Issued server-side on successful submission; the frontend field name/shape can stay the same, only its source changes |
| Payment | `PaymentStatus = "not-started" \| "demo-pending" \| "demo-complete"` (`types/registration.ts`); `ConfirmStep.tsx` shows "Frontend Demo / Payment Integration Pending" and never calls any payment SDK | Razorpay (or whichever gateway is chosen) order creation + checkout + webhook-confirmed status, landing back on the same `PaymentStatus` union (likely widened with real states like `"failed"`/`"refunded"`) |
| Pricing calculation | `lib/registration/pricing.ts` — pure client-side function over `data/pricing.ts` and `data/events/*`; `PricingSummary.isEstimate` is always `true`, with `assumptions[]` explaining exactly which brochure ambiguities (see `docs/affinity-content-truth.md` §5/§15) make it an estimate rather than a final figure | A server-side pricing endpoint that is the actual source of truth once the organizer resolves those ambiguities; the frontend calculator either stays as an instant-feedback preview (with the server total as the figure actually charged) or is retired in favour of a `POST /api/pricing/estimate` call — undecided, a future phase's call |
| Event catalogue | `data/events/{sports,cultural,online}.ts` — static, hand-transcribed from the official brochure, imported directly by `app/events/page.tsx` and the registration wizard | A `GET /api/events` (or a CMS) if the organizer ever wants to update fees/deadlines/slot counts without a code deploy; the `AffinityEvent` type (`types/event.ts`) is already the shape such an endpoint would return, so the migration is "swap the import for a fetch," not a data-model rewrite |
| Slot availability | `EventFee`/`limitedSlots` fields are static flags from the brochure (e.g. "limited slots" badge) — **never** a live remaining-count, because no source document gives one (see `docs/phase-09-events-explorer-notes.md`) | A live `GET /api/events/:id/availability` once real registrations exist server-side; only then would a "N spots left" figure be truthful rather than fabricated |
| Contact / rules content | `data/contacts.ts`, `data/rules.ts` — static, transcribed from source documents | Could move to a CMS if these need to change post-launch without a redeploy; low priority, since this content is the least likely to change once the brochure is final |
| Confirmation email / WhatsApp | None — explicitly out of scope per the project brief | A backend job triggered by successful `POST /api/registrations`, entirely outside this frontend's concern beyond maybe showing a "confirmation sent to X" note |
| QR code on the pass screen | A placeholder graphic only — encodes nothing, verifies nothing (see the success-page phase's own notes once that phase exists) | Once a real registration ID exists server-side, the QR can encode a verification URL/token the check-in desk can scan against a real backend |
| Auth | None — the wizard has no login; "participant" is just a name typed into a form field | If check-in or "resume my registration on another device" is ever wanted, this would need real auth (email/OTP most likely, given the phone/email fields already collected) — currently out of scope |

## What is deliberately *not* prepared for a backend yet

- **No API client abstraction exists in `lib/registration/`.** The
  reducer (`state.ts`) stays a pure, synchronous function; `context.tsx`
  stays a thin `useReducer` + two `useEffect`s. Adding an async
  `submitRegistration()` service layer now — before there's a real
  endpoint to call — would mean guessing at error handling, retry, and
  loading-state shapes with nothing to validate the guess against. The
  table above is the deliberate substitute: a map of *where* the seams
  are, not a premature implementation of them.
- **No environment-variable/config scaffolding** (API base URL, feature
  flags) has been added. There is nothing to point it at yet.
- **No optimistic-UI or loading/error states exist for network calls**,
  because no network call exists. The wizard's existing loading/empty/
  error states (per the project brief's item 21) are all about the
  *frontend's own* data (e.g. the events list, the details modal) — none
  of them simulate a pending network request, since simulating one for an
  endpoint that doesn't exist risks encoding a wrong assumption about its
  latency or failure modes.

## Why this is safe to build on later

Every mock value in the registration flow already carries a type that
would survive the swap to a real backend without a reshape:

- `RegistrationState` (`types/registration.ts`) is already the shape a
  server-persisted draft would round-trip through `HYDRATE`.
- `PricingSummary` already separates `lines`/`total` (what a server would
  also compute) from `isEstimate`/`assumptions` (frontend-only caveats
  that would simply become `false`/`[]` once a server figure exists).
- `ConfirmationDetails` already separates `mockRegistrationId` (swap the
  generator for a server value) from `paymentStatus` (swap the union's
  members for real gateway states) — no field needs renaming.

In short: the data model was written to already look like it talks to a
backend. It doesn't, yet — but connecting it later is expected to be a
matter of replacing specific function bodies (`generateMockRegistrationId`,
the `saveRegistrationState`/`loadRegistrationState` pair, the dispatch
site inside `ConfirmStep.tsx`) with network calls, not restructuring the
state model or the wizard's component tree.
