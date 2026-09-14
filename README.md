# AFFINITY '26 — Frontend

Phase 28 deliverable: a session-gated cinematic opening (lamp → video →
homepage), for AFFINITY '26 (11th
Edition, Karpaga Vinayaga Institute of Medical Sciences and Research
Centre, Dhruvaas batch, Arabian Nights theme). **Frontend only** — see
`docs/frontend-audit.md` and `docs/affinity-content-truth.md` (from
Phase 01) for full scope and source-of-truth rules.

## Status

- ✅ Next.js (App Router) + TypeScript + Tailwind project structure
- ✅ Centralized, typed data layer (`data/`) transcribed from
  `docs/affinity-content-truth.md` — 56 events across sports, onstage/
  offstage culturals, online culturals, and esports, plus pricing, rules,
  and contacts
- ✅ Registration wizard state model (`types/registration.ts`,
  `lib/registration/`) — participant, selectedEvents, teamDetails,
  package, pricing, review, confirmation — with a reducer, localStorage
  persistence, and a pure frontend pricing calculator
- ✅ Six wizard steps and six top-level routes wired end-to-end (Landing,
  Events, Register, Rules, Contact, Success)
- ✅ **AFFINITY '26 design system** (`styles/tokens.ts`,
  `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`,
  `components/design-system/`): the full palette, three-typeface system
  (Cinzel / Cormorant Garamond / Inter via `next/font/google`), spacing/
  shadow/border/radius/transition/container tokens, and eleven reusable
  components — `SectionContainer`, `SectionHeading`, `GoldDivider`,
  `GoldButton`, `SecondaryButton`, `OrnamentalFrame`, `EventBadge`,
  `StarField`, `Lantern`, `Crescent`, `PalaceSilhouette`. Color pairings
  are checked against a real WCAG 2.1 contrast calculation — see
  `docs/design-system-accessibility.md`. Import from
  `@/components/design-system`.
- ✅ **Global Arabian Nights atmosphere** (`components/layout/
  AtmosphereBackground.tsx`, mounted once in `app/layout.tsx`): a single
  fixed, `pointer-events-none`, `aria-hidden` backdrop layer behind every
  page — night-sky gradient, a faint geometric lattice texture, the
  Phase 03 `StarField`/`Crescent`/`Lantern`/`PalaceSilhouette` components,
  and a hairline ornamental viewport frame (safe-area aware for notched
  phones). No new animation was added — it reuses StarField's/Lantern's
  existing `prefers-reduced-motion`-gated animation rather than
  introducing new motion. Kept restrained (opacities from 0.035–0.5) and
  centralized in one place rather than repeated per page.
- ✅ **Global navigation** (`components/layout/Navbar.tsx`, now a client
  component): transparent/atmospheric header that becomes a solid
  `midnight/95` bar with a hairline gold border after 24px of scroll;
  desktop links (Story, Cause, Events, Rules, Contact) plus a Register
  CTA; a full-screen mobile overlay (`role="dialog"`, `aria-modal`) with
  a real focus trap, Escape-to-close, scroll lock, and focus returned to
  the trigger on close. Every link resolves to something that exists
  right now — Story/Cause point at the landing page's existing
  `#story-heading`/`#cause-heading` anchors, nothing was invented. Also
  added the `pt-16`/`pt-20` page-content offset a fixed header requires
  (`app/layout.tsx`) and a global `scroll-margin-top` so anchor links
  land below the header instead of under it (`app/globals.css`).
- ✅ **Cinematic hero** (`components/hero/Hero.tsx`, used by
  `app/page.tsx`): a pure Server Component (no client JS) with a six-step
  CSS reveal sequence — stars, crescent, lanterns, title, supporting
  text, CTA — via six named Tailwind animations (`animate-hero-1`…`-6`,
  one shared keyframe with six baked-in delays, `tailwind.config.ts`).
  Every fact (name, edition, presenter, institution) comes straight from
  `data/content.ts`; the one line of invented copy (the tagline) is
  explicitly one of the project brief's own approved design-copy
  examples and is commented as such. No countdown (no verified date
  exists in the data layer) and no invented statistics, per the phase's
  own instructions.
- ✅ **Story / "Enter the Story"** (`components/sections/Story.tsx`, used
  by `app/page.tsx`): the landing page's editorial introduction — large
  display typography on the left, a gold-bordered "story panel" on the
  right (`OrnamentalFrame`), not a card grid. The panel quotes two
  strings verbatim from `data/content.ts`: `aboutAffinity` as plain
  prose and `aboutAffinityBrochureVariant` as an attributed blockquote —
  the brochure's own "thousands of medical students... bigger, bolder,
  and more magical" language is presented as the organizer's quoted
  voice, not an assertion this component makes, per the phase's "do not
  invent participant numbers/achievements" instruction. Both official
  taglines (`festivalIdentity.taglines`) are rendered beneath it. A new
  `ParchmentTexture` helper (an SVG `feTurbulence` filter tinted
  desert-sand at ~7% opacity) stands in for literal cream paper, which
  would have fought the dark palette. A new reusable component,
  `ScrollReveal` (`components/design-system/ScrollReveal.tsx`, the one
  client component in `design-system/`), wraps both columns for a subtle
  fade-up on scroll — it defaults to **visible** and only hides-then-
  reveals after confirming client-side that motion is allowed and the
  element starts off-screen, so a hydration failure can never leave
  content permanently invisible.
- ✅ **Cause / "A Story Worth Seeing"** (`components/sections/Cause.tsx`,
  used by `app/page.tsx`): the blindness-awareness cause section — a
  single centered, contemplative column rather than Story's two-column
  layout, deliberately distinct from it. "A Story Worth Seeing" is
  sanctioned design copy (one of the brief's own approved examples),
  kept separate from the section's one factual label ("The Cause ·
  Blindness"). Renders `aboutCause.description` (the organizer's own
  paragraph — no charity name, donation figure, medical statistic, or
  beneficiary count appears anywhere in the source material, so none
  appears here) plus a new `aboutCause.connectedEvent` field
  (`data/content.ts`, sourced from `docs/affinity-content-truth.md` §3):
  the one place the brochure ties the cause to a specific event, the
  online Pencil Painting event's own stated theme, "A whole new world
  beyond sight." Visual: a single static "aperture of light" motif — a
  narrow gradient beam falling into soft concentric rings, reading as
  both light and, loosely, an eye adjusting to it, without drawing an
  actual eye — deliberately restrained and entirely without motion, per
  the phase's "respectful... not exploitative or overly dramatic."
  **Phase 24 update:** the section's content is now wrapped in an
  `OrnamentalFrame` (it was the one landing-page section with no
  bordered panel at all, unlike Story/Theme), and the closing blockquote
  gained a fixed `w-full max-w-xl` so its left border lines up
  consistently at every viewport width instead of shrinking to whatever
  width its own text happened to wrap to. See
  `docs/phase-24-cause-structure-fix-notes.md`.
- ✅ **Events explorer / "The Royal Courts"** (`app/events/page.tsx` —
  now a thin Server Component that reads `allEvents` and hands it to
  `components/events/EventsExplorer.tsx`, a client component): search
  (name + description, live-filtered), a three-way category filter
  (Sports / Culturals / Online, mapped from the data layer's five
  `EventCategory` values, plus an "All Events" default) with
  `aria-pressed` selection state on the active chip, a live-announced
  result count (`aria-live="polite"`), a responsive card grid (1 → 2 →
  3 columns), and a tasteful empty state when a search matches nothing.
  New reusable `components/events/EventCard.tsx` renders category/mode
  badges (`EventBadge`), the individual/duo/team/squad type, the fee
  (`lib/events/formatFee.ts` — turns `fee.amount`/`fee.unit` into
  honest copy, "Fee not stated" rather than a guessed number when
  `amount` is `null`), the event's own short description when the data
  states one, a "Limited — First N" indicator only when
  `limitedSlots.isLimited` is explicitly `true` in the source data
  (never a fabricated "X spots left" count), and the verification badge
  for any event that isn't `"confirmed"` — the first real UI surface
  for `docs/affinity-content-truth.md`'s pending-organizer/conflicting
  flags. Nothing here is hard-coded per event; every card is generated
  from `data/events/*` through `EventCard`.
- ✅ **Event details modal** (`components/events/EventDetailsModal.tsx`,
  opened from a new "View Details" trigger on every `EventCard`): a
  centered dialog on tablet/desktop, a bottom sheet on mobile (pure
  responsive Tailwind classes, no JS breakpoint branching). Reuses
  `Navbar`'s proven focus-trap/Escape/body-scroll-lock pattern (Phase
  05) rather than a new mechanism, plus a separate backdrop element for
  outside-click-to-close. Seven sections — About, Eligibility, Format,
  Team Size, Rules, Prizes, Contact — each reading straight off the
  `AffinityEvent` passed in; anything the source data leaves unstated
  renders "Details to be announced." rather than being silently
  skipped. Non-`"confirmed"` events also show their
  `verificationNotes` in full here, not just the small badge a card has
  room for. The "REGISTER FOR THIS EVENT" CTA links to
  `/register?event=<id>`; a new `EventPreselect` component (mounted in
  `app/register/page.tsx`) reads that query param once and pre-selects
  the event via the wizard's existing `SELECT_EVENT` reducer action —
  the only mechanism connecting the Events Explorer (outside
  `RegistrationProvider`) to the wizard (inside it), since the two route
  subtrees share no React context.
- ✅ **Registration wizard architecture** (`components/registration/
  Registration{Layout,Progress,Step,Summary,Navigation}.tsx`, composed by
  `app/register/page.tsx`): the "royal event registry" shell around the
  six existing step components, which are **unchanged** this phase, per
  the brief's own "do not build all step content yet." `RegistrationLayout`
  is the outer shell (heading, progress slot, responsive two-column body
  that stacks on mobile); `RegistrationProgress` is a numbered-circle
  six-step indicator (still freely clickable at any step — no gating
  logic was added); `RegistrationStep` frames the active step's content in
  an `OrnamentalFrame` with a header driven by a new `STEP_META` record
  (`types/registration.ts`); `RegistrationSummary` is a live sidebar
  snapshot (participant name, selected events, package, estimated total
  with its "subject to organizer confirmation" caveat); `RegistrationNavigation`
  is Back/Next via `SecondaryButton`/`GoldButton`, hidden rather than
  disabled at the first/last step. State persistence (`lib/registration/
  {state,context,storage,pricing}.ts`) was already complete since Phase
  02 and needed no changes. The old `WizardNav.tsx` (plain text
  buttons) is deleted — its two jobs are now `RegistrationProgress` and
  `RegistrationNavigation`. "Easy to connect to a future API" is answered
  with a new `docs/backend-integration-map.md` rather than speculative
  async code — see that doc and `docs/phase-11-registration-architecture-notes.md`.
- ✅ **Registration Step 01 — "The Traveller"** (`components/registration/
  ParticipantStep.tsx`, rewritten): the five official registration-form
  fields (Full Name, College Name, Year of Study, Phone, Email — unchanged
  from Phase 02/11, still sourced from `docs/affinity-content-truth.md`
  §4), now real styled inputs with inline, accessible validation
  (`lib/registration/validation.ts`) — required-ness, sensible length
  limits, a 10-digit Indian mobile shape, and email shape. Errors show on
  blur or after a failed submit attempt (never on first render), use
  `aria-invalid`/`aria-describedby`/`role="alert"`, and a failed attempt
  moves focus to the first invalid field. "Next" is now associated with
  this step's own `<form id="participant-form">` via the native HTML
  `form` attribute (`GoldButton` gained an optional `form` prop for this)
  rather than lifted state — the first step-gating in the wizard, scoped
  to just this one step via `RegistrationNavigation`'s `FORM_ID_BY_STEP`
  map. Selecting "PG" as year of study reveals a verification callout
  (reusing `EventBadge variant="verification"`) sourced from a new
  `data/registrationVerification.ts` flag — the PG-eligibility conflict
  between the registration form and the eligibility rules
  (`docs/affinity-content-truth.md` §9/§14(b)) is surfaced, not silently
  resolved. A new palette color, `errorRose` (`#E8735A`), was added for
  inline error text — the brief's eight-color palette has no error red,
  and the one red-family color it does have (`burgundy`) fails AA as text
  on dark backgrounds; `errorRose`'s contrast was computed before use
  (6.60:1 midnight, 6.02:1 royalNavy — see
  `docs/design-system-accessibility.md`).
- ✅ **Registration Step 02 — "Choose Your Tales"** (`components/registration/
  EventsStep.tsx`, rewritten): a real multi-select event picker sharing
  `EventCard` (now with a Phase 13 `selected`/`onToggleSelect` mode — a
  full-width footer toggle plus a gold ring around a selected card) and
  the same Sports/Culturals/Online category filter + search the public
  Events Explorer uses (extracted to `lib/events/eventGroups.ts` so both
  share one taxonomy instead of two copies). A dedicated "Your Chosen
  Tales" panel sits right below the heading — every selected event with
  its fee and its own "Remove" button — kept separate from
  `RegistrationSummary`'s sidebar total specifically so a phone user
  scrolling the grid always has the "what have I picked, how do I undo
  it" answer nearby, not only in a sidebar that renders far below the
  grid on narrow screens. "Next" is now disabled (with a visible reason)
  until at least one event is selected — a second, simpler gating
  mechanism in `RegistrationNavigation.tsx` alongside Phase 12's
  form-submit one, since Events only needs one boolean check, not
  per-field errors. No eligibility-matching logic was added — "Do not
  invent restrictions" rules out cross-checking Step 01's year-of-study
  against an event's free-text eligibility notes, since no source
  document defines that as a structured, enforceable rule; every event in
  the data layer is selectable, full stop.
- ✅ **Registration Step 03 — "Assemble Your Company"** (`components/
  registration/DetailsStep.tsx`, rewritten): the UI now branches per
  selected event — a plain confirmation line for each individual event,
  and a full roster editor (Team Name, Captain, Team Members) for each
  team/duo/squad event. Team-size bounds come from exactly one place,
  `event.team.min`/`.max` in `data/events/*`, and `lib/registration/
  validation.ts`'s new `validateTeamSelection()` never invents a missing
  bound — several real events (Short Film, Carrom) state no team size at
  all, several others (Volleyball, Basketball, Kabaddi, Football,
  Throwball, Futsal) state only a maximum, and the UI reflects exactly
  that, down to saying "Team size not specified by the organizer" rather
  than guessing. The one unconditional floor — "add at least one member"
  — is UX judgment, not a sourced fact, and is documented as such.
  Captain is a role within the roster, not a separate typed field: a new
  `captainId` (`types/registration.ts`) points at one `TeamMember.id`,
  chosen via a native `role="radiogroup"` of real radio inputs, so
  "exactly one captain" is guaranteed by HTML semantics and a captain can
  never drift out of sync with the roster. The captain reads distinctly
  three ways at once — a gold border/tint on their row, a "Captain" badge
  with a crown glyph, and the radio's own selected state. Removing a
  captain's own row clears `captainId` inside the reducer itself
  (`lib/registration/state.ts`'s `SET_TEAM_MEMBERS`), not in the UI
  handler, so the guarantee holds for any future caller. Duplicate-name
  detection is scoped to one team's own roster (case-insensitive,
  trimmed) — cross-event matching was deliberately not attempted, since
  there's no participant ID to match on and two different people can
  share a common name. "Next" joins Step 01's form-submit gating pattern
  (`details-form`, `RegistrationNavigation.tsx`) — a failed attempt
  reveals a section-level error summary for team-size/captain problems
  (neither is one specific field) plus inline per-member errors, and
  moves focus to the most useful place: the Team Name field, else the
  first invalid member row, else the section itself (`tabIndex={-1}`) as
  a fallback. See `docs/phase-14-details-step-notes.md`.
- ✅ **Registration Step 04 — "Choose Your Experience"** (`components/
  registration/PackageStep.tsx`, rewritten): a real 3-card radio choice
  between the three official packages (`data/pricing.ts`, §5 of the
  content-truth doc — ₹480 / ₹1,100 / ₹1,500, unchanged since Phase 02),
  each card showing a Food/Accommodation check-or-dash so all three
  compare directly, plus a live "Price Breakdown" panel reading straight
  from `state.pricing`. The pricing calculator (`lib/registration/
  pricing.ts`) now decomposes the package into **Base Registration /
  Food / Accommodation** lines — an exact arithmetic split of the three
  stated tier prices (computed from `PACKAGES` in code, never hardcoded),
  not an independently sourced figure — alongside each selected event's
  own fee. This phase also fixed a real pricing bug: Chess's own data
  record has carried `fee.notes: "...replaces the general package"`
  since an earlier phase, but the calculator was still adding the ₹250
  Chess fee on top of the base package; a Chess-only registrant now pays
  ₹250, not ₹730, with a `[VERIFY WITH ORGANIZER]` note surfaced if
  Food/Accommodation is added on top (a combination the brochure doesn't
  explicitly price). "Next" joins Events' simple boolean gate
  (`isPackageStepValid`) — nothing to validate about *which* package
  beyond "one is chosen." No arbitrary client-side pricing exists
  anywhere on this page — every number traces back to `PACKAGES` or
  `data/events/*`. See `docs/phase-15-package-step-notes.md`.
- ✅ **Registration Step 05 — "Review Your Tale"** (`components/
  registration/ReviewStep.tsx`, rewritten): a read-only recap in exactly
  the five sections the phase brief names — Traveller / Events / Team /
  Package / Fees — each its own bordered panel with an "Edit" button that
  jumps straight back to the step that owns that data (`SET_STEP`, the
  same action Back/the progress indicator already use). The Fees section
  reuses a newly-extracted `PricingBreakdown` component (pulled out of
  Phase 15's `PackageStep`, gaining a `bare` prop so it can sit inside
  Review's own frame without nesting two ornamental borders) — so the
  total shown here is never independently computed, just the same
  `state.pricing` every other screen already reads. A new
  `lib/registration/participantLabels.ts` centralizes the six
  year-of-study labels so `ParticipantStep`'s `<select>` and Review's
  read-only display can never quietly disagree. Below the five sections:
  a native `<details>` disclosure quoting `data/rules.ts`'s
  `termsAndConditions` verbatim (no new legal copy written for this
  screen), and the acknowledgement checkbox using the phase brief's exact
  wording, unedited. "Next" is relabelled "Proceed" for this one step
  (`RegistrationNavigation`'s new `NEXT_LABEL_BY_STEP` map) and gated on
  the checkbox alone (`isReviewStepValid`) — every other field was
  already validated on its own step. See
  `docs/phase-16-review-step-notes.md`.
- ✅ **Registration Step 06 — "The Final Seal"** (`components/
  registration/ConfirmStep.tsx`, rewritten): the project brief's own
  frontend-only payment placeholder, as two local UI phases (not a new
  wizard step — still six steps, `STEP_META`/`REGISTRATION_STEPS`
  untouched). Phase 1 shows the Registration Amount headline plus a
  "Payment Summary" (the same `PricingBreakdown` component Package/Review
  already use — never a second, independently-computed total), gated
  behind "Continue to Payment" by `state.review.acceptedTerms`. Phase 2 is
  the brief's own "Demo Payment — Frontend Only" panel: a plain statement
  that no real payment is processed, the brief's exact sentence "Payment
  integration will be connected during backend integration," and a single
  "Simulate Successful Payment (Demo)" action — no payment ID of any kind
  is generated or shown, only the pre-existing mock **registration** ID
  (`AFF26-DEMO-XXXXXX`) that `CONFIRM_REGISTRATION` has produced since
  Phase 02. On simulated success, routes to the real top-level `/success`
  page built in Phase 18 (see next bullet). `CONFIRM_REGISTRATION`'s
  `paymentStatus` now records `"demo-complete"` rather than
  `"demo-pending"`, since it only fires after the simulated payment step
  "succeeds."
- ✅ **`/success` — the Registration Pass ("Your Tale Has Begun")**
  (`app/success/page.tsx`, new — a Server Component shell so the route can
  export `metadata`, wrapping `components/success/RegistrationPass.tsx` in
  its own `RegistrationProvider`): a top-level route, not nested under
  `/register/**` — it hydrates from the same `localStorage` key
  (`affinity26.registration.v1`) regardless of which page created the
  provider, so no shared/lifted state was needed. Shows the mock
  Registration ID / Participant / College / Events / Amount / Payment
  Status pulled straight from wizard state (never recomputed), a
  hand-drawn deterministic QR-shaped placeholder captioned "Demo QR —
  verification will be connected later" (the brief's exact wording,
  `role="img"` + an `aria-label` saying it isn't a real scannable code),
  and Download Pass / Print / Back to Home actions. "Not a real
  registration" is stated three separate ways (page banner, an on-card
  "Demo — Not a Real Pass" tag, and inside the downloaded artifact
  itself). Download builds a small self-contained `.html` file via `Blob`
  + `URL.createObjectURL` (no PDF/canvas/QR library exists in this
  project's dependencies and npm is unreachable to add one — flagged as a
  sandbox constraint, not a content decision); Print uses `window.print()`
  with `print:` Tailwind variants scoped to this page's own content only
  (the shared Navbar/Footer/AtmosphereBackground were deliberately left
  untouched — out of this phase's scope). `app/register/success/page.tsx`
  (the old Phase 02 placeholder) now just `redirect()`s to `/success`
  rather than hosting a second, stale copy. See
  `docs/phase-18-success-page-notes.md`, including why this reverses
  Phase 17's own stated assumption that a route outside `/register/**`
  would need a larger provider restructuring.
- ✅ **`/rules` — "Laws of the Realm"** (`app/rules/page.tsx`, rewritten;
  `components/rules/RulesContent.tsx`, new; `components/design-system/
  Accordion.tsx`, new; `data/rulesCategories.ts` and `data/
  rulesVerification.ts`, new): the brief's eleven named categories
  (Registration, Eligibility, Identification, Sports, Culturals,
  Accommodation, Food, Discipline, Safety, Payment, General Conduct),
  each an independently collapsible accordion panel laid out in a
  two-column CSS grid from `lg` up and one column below it — same
  accordion behavior at every breakpoint, just a different reading
  layout. Every bullet is the identical string already verified in
  `data/rules.ts`, referenced by array index from a new
  presentation-only regrouping file, never retyped — nothing was
  invented or reworded to fill out a category. The refund-policy
  conflict (§14(a)) gets its own typed flag (`data/
  rulesVerification.ts`, mirroring the existing `pgEligibilityConflict`
  pattern) and is surfaced under Payment; the pre-existing PG-eligibility
  conflict is surfaced under Eligibility — both via the same `EventBadge
  variant="verification"` treatment already used in the registration
  wizard. See `docs/phase-19-rules-page-notes.md`.
- ✅ **`/contact` — "The Royal Herald"** (`app/contact/page.tsx`,
  rewritten; `components/contact/ContactContent.tsx` and `ContactIcons.tsx`,
  new; `lib/contact/contactLinks.ts`, new): the brief's four named
  categories — Organising Secretaries, Registration Desk, Registration
  WhatsApp, Instagram — each its own card. Phone numbers are real `tel:`
  links (same whitespace-stripped-digits convention `EventDetailsModal`
  already uses), WhatsApp opens `wa.me`, Instagram opens `instagram.com`
  — nothing invented (no email, website, address, or other social
  account exists anywhere in the source material, so none appears here).
  `data/contacts.ts`'s other four verified groups (Treasuries,
  Accommodation, Sports Secretaries, Cultural Secretaries) stay intact
  in the data layer but aren't rendered by this page — a scoping choice
  matching the brief's exact four-category list, not a truth-mode
  omission. See `docs/phase-20-contact-footer-notes.md`.
- ✅ **Global Footer — "The Story Continues"** (`components/layout/
  Footer.tsx`, rewritten): brand/institution, Quick Links (Events, Rules,
  Registration, Contact), and Social (Instagram, WhatsApp) in three
  compact columns, replacing the Phase 02 inline-styled placeholder.
  Deliberately doesn't repeat `/contact`'s full phone rosters, to keep
  it "elegant and compact" per the brief's own wording. **Phase 27
  update:** a visual-only redesign (same links, same facts) — the
  footer now sits on an opaque `royal-navy` band carrying a static
  `StarField` + a low-opacity `PalaceSilhouette` skyline along its top
  edge (the same atmosphere motif Hero/Theme/Cause already use), the
  brand column gained a small attributed quote from `festivalIdentity.
  taglines`, both nav columns gained a small gold accent under their
  labels and a hover-fade underline + gold-dot bullets on every link,
  and the closing line now sits under a small centered `Crescent` mark.
  See `docs/phase-27-footer-redesign-notes.md`.
- ✅ **Phase 21 — Responsive design audit** (no new pages/functionality,
  per the phase brief): every page and component was read and reasoned
  about against the nine requested widths (320/375/390/430/768/1024/
  1280/1440/1920px), since this sandbox still has no way to render a real
  browser. Found and fixed two genuine bugs, both the same underlying
  flexbox issue (a text element next to a fixed-width sibling in a
  non-wrapping flex row, missing `min-w-0`, so a long real event name or
  price-line label could overflow instead of wrapping): the
  `EventDetailsModal` header title, and `PricingBreakdown`'s line-item
  labels (shared by PackageStep/ReviewStep/ConfirmStep). Everything else
  checked — Navbar, Hero, Story, Cause, Events explorer/EventCard, the
  registration wizard shell, every step's forms/team-member roster,
  Review, Confirm, the Registration Pass, Rules' Accordion, Contact, and
  the Footer — was already handling narrow widths correctly and was left
  unchanged. See `docs/phase-21-responsive-audit-notes.md` for the full
  reasoning, including two things deliberately reviewed and *not*
  changed (the 36px mobile step-indicator circles; Cause's intentionally
  left-aligned pull-quote).
- ✅ **Phase 22 — Motion system** (no new pages/functionality, per the
  phase brief): audited every animation already in the project against
  the brief's five motion categories (Hero/Sections/Cards/Buttons/Forms)
  and its "avoid" list (parallax, spinning, bouncing, constant floating,
  long animations, distracting particles) — nothing already in place
  violated the avoid-list, but two categories had real gaps. Fixed:
  Hero's six-stage reveal tightened from ~2650ms to ~1800ms total
  (`tailwind.config.ts`) to actually read as "cinematic but short";
  `OrnamentalFrame` gained an opt-in `interactive` prop (small hover
  lift + the existing `shadow-gold-glow` token), applied to `EventCard`
  and `PackageStep`'s package cards — the two places the brief means by
  "cards" — since neither had any hover feedback before; `GoldButton`/
  `SecondaryButton` gained a `active:scale-[0.97]` press micro-
  interaction alongside their existing hover glow; and two selection-
  state color swaps that previously snapped instantly
  (`DetailsStep`'s captain row, `RegistrationProgress`'s connecting
  hairlines) now carry `transition-colors duration-base`, matching every
  other state-change color transition in the app. Everything else —
  StarField's twinkle, Lantern's glow pulse, the modal's fade/rise, the
  Accordion's expand/collapse, ScrollReveal's usage on Story/Cause only —
  was reviewed and deliberately left unchanged. See
  `docs/phase-22-motion-system-notes.md` for the full reasoning.
- ✅ **"The Theme — Arabian Nights"** (`components/sections/Theme.tsx`,
  new, used by `app/page.tsx` in place of the old Phase 02 placeholder —
  a bare, unstyled `<h2>`/`<p>` with no container or responsive classes,
  which is what prompted this phase): a centered heading ("The Theme" +
  a small `Crescent` mark, then "Arabian Nights" — the theme's real
  name, stated directly by the project brief) over a `GoldDivider`, then
  both of the source material's verbatim theme descriptions
  (`docs/affinity-content-truth.md` §2 — "two verbatim descriptions
  exist across the source docs, both consistent, no conflict") shown
  side by side as attributed quote panels, one column on mobile/tablet,
  two from `lg` up. `data/content.ts` gained a new
  `aboutThemeBrochureVariant` field (the brochure's own theme copy,
  which had never been transcribed before — only the wordings-document
  version, `aboutTheme`, existed) — both are quoted verbatim, never
  paraphrased together into new prose. See
  `docs/phase-23-theme-section-notes.md`.
- ✅ **Events teaser** (`components/sections/EventsTeaser.tsx`, new, used
  by `app/page.tsx` in place of the old Phase 02 placeholder — a bare
  `<h2>`/`<p>`/plain-text `<Link>` with no container or responsive
  classes, which is what prompted this phase): a centered heading
  ("Events" eyebrow, "The Royal Courts Await" — reusing the real
  `/events` page's own "The Royal Courts" name, since this section is a
  preview of that page), the same total-count sentence the placeholder
  showed, three `OrnamentalFrame` stat tiles (Sports / Culturals /
  Online, summed from `eventCounts` using the exact same grouping
  `lib/events/eventGroups.ts` already defines for the Events Explorer and
  the registration wizard's Events step), and a `GoldButton` in place of
  the old plain-text link. Every number is a real `.length` count — none
  invented. With this phase, every landing-page section is now a real,
  built component. See `docs/phase-25-events-teaser-notes.md`.
- ✅ **Phase 26 — Accessibility audit** (no new pages/functionality, per
  the phase brief): a manual, file-by-file read of every component
  against the full checklist (semantic HTML, heading hierarchy, labels,
  keyboard nav, focus-visible, modal focus trapping, ESC handling, ARIA,
  contrast, reduced motion, touch targets, form errors, screen readers,
  button/link semantics, image alt text). Most of the app was already
  correct — modals' focus traps, every form field's label/error wiring,
  the Accordion, the contrast matrix, the reduced-motion gate, and
  touch-target sizing had all been built right the first time across
  prior phases. Four genuine issues were found and fixed: `/events`
  skipped from its `<h1>` straight to each card's `<h3>` with no `<h2>`
  between (`EventCard` gained a `headingLevel` prop, `"h2"` on the public
  explorer, unchanged `"h3"` default in the wizard); advancing/going back
  a registration-wizard step never told keyboard/screen-reader users
  anything changed (`RegistrationStep` now moves focus to the step's own
  heading on every step change, skipping the very first render);
  `PricingBreakdown`'s "Total" row was a `dt`/`dd` pair sitting outside
  any `<dl>` (moved inside the existing one); and the four external
  (`target="_blank"`) Instagram/WhatsApp links had no accessible warning
  that they open a new tab (each gained a `sr-only` "(opens in a new
  tab)" suffix). See `docs/phase-26-accessibility-audit-notes.md` for the
  full audit, including what was reviewed and deliberately left
  unchanged.
- ✅ **Phase 28 — Cinematic intro**: a full-viewport, session-gated opening
  built around three user-supplied assets in `public/intro/` (lamp image,
  genie image, intro video) — `components/intro/CinematicIntro.tsx`,
  mounted once on the homepage only. Plays the supplied video (no
  CSS-recreated animation, per the brief) once per browsing tab
  (`sessionStorage`, via `lib/intro/introStorage.ts`), with an always-
  immediate "Skip Intro" button, full `prefers-reduced-motion` support (no
  video ever mounts for those users — see the phase notes for how "show
  immediately" and "short elegant fade" are both satisfied by the
  project's existing global reduced-motion gate rather than a special
  case), and a graceful static-lamp-image fallback (plus an 8-second
  stuck-timer, not just `onError`) if the video can't play at all. A
  dual no-flash mechanism (a pre-hydration inline `<script>` plus a
  `useLayoutEffect`) keeps repeat visits from showing even one flashed
  frame of the overlay, and `Navbar`/`Footer` are marked `inert` while the
  intro is up so keyboard/screen-reader users can't tab into the live nav
  hidden underneath it. See `docs/phase-28-cinematic-intro-notes.md` for
  the full reasoning, including one asset-filename correction from the
  phase brief's own wording and the still-open, browser-only-verifiable
  items (real mobile autoplay behavior, actual video duration vs. the
  stuck-timeout, lamp/genie composition at narrow widths).

## ⚠️ Verification could not be fully automated in this session

This project was authored in a cloud sandbox whose outbound network
access is restricted to an organization-controlled allowlist. **The npm
registry (`registry.npmjs.org`), PyPI, and jsdelivr are all outside that
allowlist** (confirmed with direct `curl` tests — each returns
`403 host_not_allowed`), so `npm install` — and therefore `next lint`,
`next build`, and a real project-wide `tsc --noEmit` against the actual
`next`/`react`/`@types/*` packages — could not be run here.

What **was** verified in this session, using TypeScript and esbuild that
happen to be globally preinstalled in the sandbox (not this project's own
dependencies), re-run at the end of every phase including Phase 03:

- Every pure-logic/data file (`types/*.ts`, `data/**/*.ts`, `styles/
  tokens.ts`, `styles/star-positions.ts`,
  `lib/registration/{pricing,state,storage}.ts` — i.e. everything that
  doesn't import `react` or `next`) passes a strict `tsc --noEmit`
  (`strict: true`, `noUncheckedIndexedAccess: true`) with **zero errors**.
  This is the highest-risk code in this phase, since it's ~56 events
  hand-transcribed from a 182-page PDF. Phase 11's `STEP_META` record,
  Phase 12's `lib/registration/validation.ts` /
  `data/registrationVerification.ts`, Phase 13's
  `lib/events/eventGroups.ts` / `isEventsStepValid` addition, Phase 14's
  `EventSelection`'s new `teamName`/`captainId` fields, `state.ts`'s two
  new actions, and `validation.ts`'s `validateTeamSelection` /
  `isTeamSelectionValid` / `isDetailsStepValid`, Phase 15's rewritten
  `lib/registration/pricing.ts` (Base/Food/Accommodation decomposition +
  the Chess-only fix) and `validation.ts`'s `isPackageStepValid`, and
  Phase 16's new `lib/registration/participantLabels.ts` and
  `validation.ts`'s `isReviewStepValid`, and Phase 17's `state.ts`
  `CONFIRM_REGISTRATION` change (`paymentStatus` now `"demo-complete"`)
  are all part of this same strict pass — zero errors. Phase 18 added no
  new pure-logic `.ts` files (only `.tsx` components and a `redirect()`
  page), so the explicitly-checked file list was unchanged from Phase 16
  through Phase 18. Phase 19 added `data/rulesCategories.ts` (the eleven-
  category regrouping — its `reg()`/`tnc()`/`sports()`/`cult()`/`acc()`/
  `restr()` index-lookup helpers exist specifically to keep every entry
  typed as `string`, not `string | undefined`, under this project's
  `noUncheckedIndexedAccess: true`) and `data/rulesVerification.ts` (the
  refund-policy conflict flag) to the strict pass. Phase 20 added
  `lib/contact/contactLinks.ts` (the `tel:`/`wa.me`/Instagram link
  builders) and, for the first time, `data/contacts.ts` itself (it
  existed since Phase 02 but had only ever been checked transitively via
  its importers until now). `data/pricing.ts` (Phase 15) and
  `data/rules.ts` (Phase 16) were also added to the explicitly-checked
  file list in their respective phases (previously only checked
  transitively via their importers).
- Every `.ts`/`.tsx` file in the project — **79 files as of Phase 28**
  (77 unchanged through Phase 27; Phase 28 added
  `components/intro/CinematicIntro.tsx` and `lib/intro/introStorage.ts`)
  — parses as syntactically valid TypeScript/JSX via `esbuild`.
- Every `@/...` import in the codebase (**169 as of Phase 28** — 167
  unchanged through Phase 27; Phase 28 added two, `app/page.tsx` →
  `CinematicIntro` and `CinematicIntro` → `introStorage`) resolves to a
  real file on disk (checked by script, not by eye).
- Phase 09 brought the full `data/events/*` layer (all ~56 event
  records) into the strict `tsc --noEmit` pass for the first time,
  alongside `lib/events/formatFee.ts`; Phase 10 added
  `lib/events/eventLabels.ts` to that same pass — zero errors.
- `EventBadge`'s discriminated-union prop narrowing (`variant`/`value`
  destructured together, then switched on) was isolated and re-verified
  under a real `tsc --strict` pass — this pattern can silently lose type
  narrowing in some TypeScript setups, so it wasn't just assumed safe.
- Every color pairing used in `components/design-system/` is checked
  against a real, programmatically-computed WCAG 2.1 contrast ratio, not
  eyeballed — see `docs/design-system-accessibility.md`. One real issue
  was caught this way and fixed before it shipped: antiqueGold/warmGold/
  desertSand text on an emerald background looked plausible but fails AA
  (2.86–4.18:1); `EventBadge`'s only emerald-fill chip (`mode="online"`)
  uses ivory text instead (6.03:1).

What was **not** verified, and needs to happen on a machine with normal
internet access before this is trusted as "done":

```bash
npm install
npm run typecheck   # tsc --noEmit, against the real next/react types
npm run lint        # next lint
npm run build        # next build
npm run dev          # click through all 6 registration steps + 5 routes,
                      # and visually confirm the design system components
                      # render as intended (colors, fonts actually
                      # downloading via next/font/google, StarField/
                      # Lantern animation, focus rings, reduced-motion) —
                      # plus, as of Phase 04, that AtmosphereBackground
                      # actually sits behind Navbar/main/Footer rather
                      # than on top of them (verified here by CSS stacking
                      # rules, not by looking at a rendered browser)
```

If any of those surface errors, they're most likely in the `.tsx` files
(the parts that couldn't be checked against real React/Next.js types), or
in whether the Google Fonts (`Cinzel`, `Cormorant Garamond`, `Inter`)
actually fetch correctly at build time — that network call could not be
tested here either. Please report anything that comes up — this note
stays here until a clean `npm run build` confirms it can be deleted.

## Project structure

```
app/                  Next.js App Router routes (Landing, Events, Register + 6-step
                       wizard, Success, Rules, Contact) — Events is now the real
                       Phase 09 explorer, success/page.tsx is the real Phase 18
                       Registration Pass (app/register/success/page.tsx is now just
                       a redirect() to it), rules/page.tsx is the real Phase 19
                       "Laws of the Realm", and contact/page.tsx is the real Phase
                       20 "The Royal Herald"; page.tsx (the landing page) now
                       renders only real, built sections as of Phase 25 — no
                       Phase 02 placeholder UI remains anywhere in the app;
                       layout.tsx wires the design system's fonts/base styles
components/
  design-system/       Phase 03: SectionContainer, SectionHeading, GoldDivider,
                       GoldButton, SecondaryButton, OrnamentalFrame, EventBadge,
                       StarField, Lantern, Crescent, PalaceSilhouette (+ index.ts).
                       Phase 07 added ScrollReveal and Phase 19 added Accordion —
                       the two client components here (open/closed panel state).
  layout/              Navbar (Phase 05 — real, scroll-aware, with mobile
                       overlay), Footer (Phase 20 — real "The Story Continues":
                       brand/institution, Quick Links, Social columns),
                       AtmosphereBackground (Phase 04 — global backdrop)
  hero/                Hero (Phase 06 — cinematic six-step reveal)
  sections/            Story (Phase 07 — editorial story/introduction section),
                       Theme (Phase 23 — "The Theme — Arabian Nights," replacing
                       the old Phase 02 placeholder), Cause (Phase 08 —
                       blindness-awareness cause section, restructured in Phase
                       24), EventsTeaser (Phase 25 — "The Royal Courts Await"
                       stat-tile preview of the Events Explorer, replacing the
                       last Phase 02 placeholder)
  events/              EventCard (Phase 13 — gained a selected/onToggleSelect
                       mode alongside its onViewDetails one), EventsExplorer
                       (Phase 09 — search/filter/grid), EventDetailsModal
                       (Phase 10 — 7-section modal/bottom-sheet); EventsExplorer
                       and EventDetailsModal are client components, EventCard is not
  registration/         ParticipantStep (Phase 12 — real, validated "Traveller"
                       form); EventsStep (Phase 13 — real, validated "Choose Your
                       Tales" multi-select); DetailsStep (Phase 14 — real,
                       validated "Assemble Your Company" individual confirmations
                       + team roster editors); PackageStep (Phase 15 — real
                       "Choose Your Experience" 3-card package picker + live price
                       breakdown); ReviewStep (Phase 16 — real "Review Your Tale"
                       recap, five Edit-able sections + terms acknowledgement);
                       PricingBreakdown (Phase 16 — the price-breakdown panel,
                       extracted out of PackageStep so PackageStep, ReviewStep,
                       and now ConfirmStep share one always-in-sync computation);
                       ConfirmStep (Phase 17 — real "The Final Seal" two-phase
                       frontend-only payment placeholder); EventPreselect
                       (Phase 10 — reads ?event=<id>, dispatches SELECT_EVENT);
                       Phase 11's five architecture components:
                       RegistrationLayout, RegistrationProgress, RegistrationStep,
                       RegistrationSummary, RegistrationNavigation (Phase 14 added
                       "details-form" to FORM_ID_BY_STEP; Phase 15 added
                       "package" to NEXT_DISABLED_BY_STEP; Phase 16 added
                       "review" to it too, plus a new NEXT_LABEL_BY_STEP map so
                       Review's own advance button reads "Proceed")
  success/              RegistrationPass (Phase 18 — the real post-wizard
                       Registration Pass: pass card, deterministic QR
                       placeholder, Download/Print/Back-Home actions; client
                       component, wrapped in its own RegistrationProvider by
                       app/success/page.tsx)
  rules/                RulesContent (Phase 19 — builds the "Laws of the Realm"
                       Accordion's eleven items from data/rulesCategories.ts,
                       plus the two flagged-conflict callouts; Server Component)
  contact/              ContactContent (Phase 20 — the four Contact categories
                       as OrnamentalFrame cards; Server Component), ContactIcons
                       (generic phone/chat/camera glyphs — not brand marks)
data/                  SOURCE OF TRUTH — see docs/affinity-content-truth.md
  events/               sports.ts, cultural.ts, online.ts + index.ts
  pricing.ts, rules.ts, contacts.ts, content.ts
  registrationVerification.ts  Phase 12 — wizard-level (non-event) verification
                       flags, e.g. the PG-eligibility conflict
  rulesCategories.ts    Phase 19 — the eleven-category regrouping of
                       rules.ts's six sections, referenced by array index only
                       (never retyped); rulesVerification.ts — the
                       refund-policy conflict flag, same pattern as
                       registrationVerification.ts
lib/events/            formatFee.ts (Phase 09 — event fee → display copy, never a
                       fabricated number), eventLabels.ts (Phase 10 — shared
                       type/mode/day display labels), eventGroups.ts (Phase 13 —
                       shared Sports/Culturals/Online category-group taxonomy,
                       used by both EventsExplorer and EventsStep)
lib/contact/           contactLinks.ts (Phase 20 — tel:/wa.me/Instagram link
                       builders; reformats already-verified contacts.ts data,
                       never a new fact)
lib/registration/      Reducer (state.ts — Phase 14 added SET_TEAM_NAME/
                       SET_CAPTAIN and captain-cleanup logic; Phase 17 changed
                       CONFIRM_REGISTRATION's paymentStatus to "demo-complete"),
                       pricing calculator
                       (pricing.ts — Phase 15 decomposed the package line into
                       Base Registration/Food/Accommodation and fixed a
                       Chess-only double-charge bug), localStorage persistence
                       (storage.ts), React context (context.tsx), field
                       validation (validation.ts — Phase 12 participant rules,
                       Phase 14 added validateTeamSelection/isTeamSelectionValid/
                       isDetailsStepValid, Phase 15 added isPackageStepValid,
                       Phase 16 added isReviewStepValid — all UX rules, not
                       sourced facts), participantLabels.ts (Phase 16 — shared
                       year-of-study display labels, used by ParticipantStep and
                       ReviewStep)
styles/                tokens.ts (design tokens, imported by tailwind.config.ts),
                       star-positions.ts (deterministic StarField data)
types/                 event.ts, registration.ts — the core TypeScript data model
```

## Data-layer conventions (read before editing `data/`)

- **Never hardcode a fact in a component.** If a page needs an event
  name, fee, deadline, or contact, it imports from `data/`.
- Every `AffinityEvent` carries a `verificationStatus`:
  `"confirmed"` | `"pending-organizer"` | `"conflicting"`. Anything other
  than `"confirmed"` has a `verificationNotes` string explaining exactly
  what's unstated or inconsistent in the source brochure — the UI should
  surface this eventually (Phase 03+), not hide it.
- The pricing calculator (`lib/registration/pricing.ts`) always returns
  `isEstimate: true` plus an `assumptions` array, because the brochure
  never states how the base registration package relates to most
  per-event fees (see `docs/affinity-content-truth.md` §5/§15). Don't
  "fix" this by making the estimate look more certain than the source
  data supports — get organizer confirmation first, then update
  `data/pricing.ts`'s `baseIncludesUnlistedEvents.confirmed` flag.

## Setup (once run on a machine with internet access)

```bash
npm install
npm run dev
```
