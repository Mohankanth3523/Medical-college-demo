"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRegistration } from "@/lib/registration/context";
import { getEventById } from "@/data/events";
import type { PaymentStatus } from "@/types/registration";
import {
  SectionContainer,
  SectionHeading,
  GoldDivider,
  GoldButton,
  SecondaryButton,
  OrnamentalFrame,
  BrandLogo,
} from "@/components/design-system";
import { siteBranding } from "@/data/branding";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  "not-started": "Not Started",
  "demo-pending": "Demo Payment Pending",
  "demo-complete": "Demo Payment Simulated — Not a Real Transaction",
};

/**
 * Deterministic "QR-shaped" decoration — never real QR data (this pass
 * has nothing to encode; there's no backend to verify against). A fixed
 * boolean grid, not `Math.random()`, so server and client render
 * identically and nothing shifts between renders. Three finder-style
 * corner squares echo a real QR code's silhouette closely enough to read
 * as "this is where a QR would go" at a glance, without ever being
 * mistaken for a scannable one — the caption underneath says so anyway.
 */
const QR_GRID: boolean[][] = [
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1],
].map((row) => row.map(Boolean));

function QRPlaceholder() {
  const cell = 8;
  const size = QR_GRID.length * cell;
  return (
    <svg
      role="img"
      aria-label="Demo QR placeholder — not a real, scannable code"
      viewBox={`0 0 ${size} ${size}`}
      className="h-32 w-32 shrink-0 text-midnight sm:h-36 sm:w-36"
    >
      <rect x="0" y="0" width={size} height={size} fill="#F7F0DE" />
      {QR_GRID.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="currentColor" />
          ) : null,
        ),
      )}
    </svg>
  );
}

/** Builds a small, self-contained, print-styled HTML document mirroring the on-screen pass — the "Download Pass" artifact. No PDF/image-generation library is used (none is part of this project's dependencies), so the download is an .html file the participant can open or print themselves; see docs/phase-18-success-page-notes.md for why. */
function buildPassHtml(data: {
  registrationId: string;
  participant: string;
  college: string;
  events: string[];
  amount: string;
  paymentStatus: string;
  generatedAt: string;
}): string {
  const eventsList = data.events.length > 0 ? data.events.map((e) => `<li>${e}</li>`).join("") : "<li>—</li>";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>AFFINITY '26 Registration Pass (Demo) — ${data.registrationId}</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; background: #F7F0DE; color: #0D1530; margin: 0; padding: 2.5rem 1.5rem; }
  .pass { max-width: 40rem; margin: 0 auto; border: 2px solid #C9A24D; padding: 2rem; }
  .banner { max-width: 40rem; margin: 0 auto 1.5rem; border: 1px solid #C9A24D; padding: 0.85rem 1.1rem; font-size: 0.85rem; }
  h1 { font-size: 1.1rem; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 0.25rem; }
  h2 { font-size: 1.6rem; margin: 0 0 1.25rem; }
  dl { display: grid; grid-template-columns: 10rem 1fr; row-gap: 0.6rem; column-gap: 1rem; margin: 0; }
  dt { font-weight: bold; }
  dd { margin: 0; }
  .demo-tag { display: inline-block; border: 1px solid #3A1024; color: #3A1024; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.15rem 0.5rem; margin-bottom: 1rem; }
  .qr-note { margin-top: 1.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-top: 1px solid #C9A24D; padding-top: 0.75rem; }
</style>
</head>
<body>
  <div class="banner">
    <strong>This is a frontend demo, not a real registration confirmation.</strong>
    No payment was processed and no data was sent to any server. Generated ${data.generatedAt}.
  </div>
  <div class="pass">
    <span class="demo-tag">Demo — Not a Real Pass</span>
    <h1>AFFINITY '26</h1>
    <h2>Registration Pass</h2>
    <dl>
      <dt>Registration ID</dt><dd>${data.registrationId}</dd>
      <dt>Participant</dt><dd>${data.participant}</dd>
      <dt>College</dt><dd>${data.college}</dd>
      <dt>Events</dt><dd><ul style="margin:0;padding-left:1.1rem;">${eventsList}</ul></dd>
      <dt>Amount</dt><dd>${data.amount} (estimate — subject to organizer confirmation)</dd>
      <dt>Payment Status</dt><dd>${data.paymentStatus}</dd>
    </dl>
    <p class="qr-note">Demo QR — verification will be connected later</p>
  </div>
</body>
</html>`;
}

/**
 * `/success` — Phase 18. A premium AFFINITY '26 registration pass concept
 * (project brief's SUCCESS PAGE section), reading confirmation state from
 * `useRegistration()`. This route sits outside `/register/**`, so
 * `app/success/page.tsx` wraps this component in its own
 * `<RegistrationProvider>` rather than relying on `app/register/layout.tsx`
 * — the provider hydrates from the same `localStorage` key
 * (`lib/registration/storage.ts`) regardless of which page mounted it, so
 * the mock confirmation still shows up correctly here.
 *
 * Every figure on this pass already carries its own truth-mode guarding
 * upstream (Phase 15/16's pricing calculator, Phase 17's payment-status
 * value) — this page only displays what `state` already holds, it adds
 * no new computation.
 *
 * Phase 29: the decorative pencil-line "crest" glyph that used to sit in
 * the header has been replaced with the real, official AFFINITY '26
 * event emblem (`BrandLogo`, small — matching the glyph's old footprint,
 * not enlarged) — the brief's own success-page section asks for the
 * event's official identity here, not an invented ornament standing in
 * for it. Digital partners get a single small, plain-TEXT line near the
 * bottom (no logo images at all) — the brief is explicit that partner
 * branding must never dominate the registration pass, and a demo pass a
 * participant might screenshot or print is exactly the surface where
 * "dominate" is easiest to accidentally do with two more logo images.
 */
export function RegistrationPass() {
  const { state } = useRegistration();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const events = state.selectedEvents
    .map((selection) => getEventById(selection.eventId))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    if (!state.confirmation) return;
    const html = buildPassHtml({
      registrationId: state.confirmation.mockRegistrationId,
      participant: state.participant.name.trim() || "—",
      college: state.participant.collegeName.trim() || "—",
      events: events.map((event) => event.name),
      amount: state.pricing ? formatRupees(state.pricing.total) : "—",
      paymentStatus: PAYMENT_STATUS_LABEL[state.confirmation.paymentStatus],
      generatedAt: new Date(state.confirmation.generatedAt).toLocaleString("en-IN"),
    });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AFFINITY26-Registration-Pass-DEMO-${state.confirmation.mockRegistrationId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Best-effort loading gate: RegistrationProvider hydrates from
  // localStorage in its own effect after mount, so the very first client
  // render always shows `confirmation: null` (matching SSR, to avoid a
  // hydration mismatch) even when a real mock confirmation exists in
  // storage. Without this, a participant who just completed Step 06 would
  // see a flash of "No registration found" before the real pass appears.
  // This can't be made fully race-proof without a real browser to verify
  // timing against — see docs/phase-18-success-page-notes.md.
  if (!mounted) {
    return (
      <SectionContainer width="content" verticalPadding>
        <p role="status" className="text-center font-body text-sm text-desert-sand">
          Loading your registry…
        </p>
      </SectionContainer>
    );
  }

  if (!state.confirmation) {
    return (
      <SectionContainer width="content" verticalPadding>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <SectionHeading as="h1" title="No Registration Found" divider={false} />
          <p className="font-body text-sm text-desert-sand">
            You haven&apos;t completed the AFFINITY &apos;26 registration wizard yet, or your demo
            session has been cleared.
          </p>
          <GoldButton href="/register">Start Registration</GoldButton>
        </div>
      </SectionContainer>
    );
  }

  const { confirmation, participant } = state;

  return (
    <SectionContainer width="content" verticalPadding>
      <div
        role="status"
        className="mx-auto mb-8 max-w-2xl border border-antique-gold/50 px-4 py-3 text-center print:hidden"
      >
        <p className="font-body text-sm text-desert-sand">
          <strong className="text-ivory">This is a frontend demo, not a real confirmation.</strong>{" "}
          No payment was processed and no data was sent to any server.
        </p>
      </div>

      <SectionHeading
        as="h1"
        eyebrow="AFFINITY '26 · Registration Complete (Demo)"
        title="Your Tale Has Begun"
        subtitle="A demo copy of your registration pass — carry it, print it, or save it below."
      />

      <div className="mx-auto mt-10 max-w-xl">
        <OrnamentalFrame
          padding="lg"
          className="relative print:border-midnight print:bg-ivory print:text-midnight"
        >
          <span className="absolute right-4 top-4 border border-burgundy px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-burgundy print:border-burgundy">
            Demo — Not a Real Pass
          </span>

          <div className="flex items-center gap-3">
            <BrandLogo
              src={siteBranding.event.logo}
              alt={siteBranding.event.alt}
              heightClassName="h-8 sm:h-9"
              padding="sm"
              className="print:hidden"
            />
            {/* Print variant: `BrandLogo`'s ivory plaque is redundant once
                the whole pass card is already printed on an ivory ground
                (see `print:bg-ivory` on OrnamentalFrame above) — swap to
                the bare image so print output doesn't show a visible box
                around the mark for no reason. */}
            <BrandLogo
              src={siteBranding.event.logo}
              alt={siteBranding.event.alt}
              heightClassName="h-8"
              variant="bare"
              className="hidden print:inline-flex"
            />
            <div>
              <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-desert-sand print:text-midnight/70">
                AFFINITY &apos;26
              </p>
              <p className="font-display text-2xl font-semibold tracking-wide text-ivory print:text-midnight">
                Registration Pass
              </p>
            </div>
          </div>

          <GoldDivider size="md" className="my-6" />

          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand print:text-midnight/70">
                Registration ID
              </dt>
              <dd className="mt-1 font-body text-sm text-ivory print:text-midnight">
                {confirmation.mockRegistrationId}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand print:text-midnight/70">
                Payment Status
              </dt>
              <dd className="mt-1 font-body text-sm text-ivory print:text-midnight">
                {PAYMENT_STATUS_LABEL[confirmation.paymentStatus]}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand print:text-midnight/70">
                Participant
              </dt>
              <dd className="mt-1 font-body text-sm text-ivory print:text-midnight">
                {participant.name.trim() || "—"}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand print:text-midnight/70">
                College
              </dt>
              <dd className="mt-1 font-body text-sm text-ivory print:text-midnight">
                {participant.collegeName.trim() || "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand print:text-midnight/70">
                Events
              </dt>
              <dd className="mt-1 font-body text-sm text-ivory print:text-midnight">
                {events.length > 0 ? (
                  <ul className="flex flex-col gap-0.5">
                    {events.map((event) => (
                      <li key={event.id}>{event.name}</li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand print:text-midnight/70">
                Amount
              </dt>
              <dd className="mt-1 font-display text-lg font-semibold text-antique-gold print:text-midnight">
                {state.pricing ? formatRupees(state.pricing.total) : "—"}
              </dd>
              <dd className="font-body text-xs text-desert-sand print:text-midnight/70">
                Estimate — subject to organizer confirmation.
              </dd>
            </div>
          </dl>

          <GoldDivider size="md" className="my-6" />

          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-between">
            <QRPlaceholder />
            <p className="max-w-[10rem] text-center font-body text-[11px] font-medium uppercase tracking-wide text-desert-sand sm:text-right print:text-midnight/70">
              Demo QR — verification will be connected later
            </p>
          </div>

          {siteBranding.digitalPartners.length > 0 ? (
            <p className="mt-6 border-t border-antique-gold/20 pt-4 text-center font-body text-[10px] uppercase tracking-[0.15em] text-desert-sand/70 print:border-midnight/20 print:text-midnight/60">
              Digital Partners —{" "}
              {siteBranding.digitalPartners.map((partner) => partner.name).join(" · ")}
            </p>
          ) : null}
        </OrnamentalFrame>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-4 sm:flex-row sm:justify-center print:hidden">
        <GoldButton type="button" onClick={handleDownload}>
          Download Pass
        </GoldButton>
        <SecondaryButton type="button" onClick={handlePrint}>
          Print
        </SecondaryButton>
        <Link
          href="/"
          className="font-body text-sm font-medium uppercase tracking-wide text-desert-sand underline decoration-antique-gold/50 underline-offset-4 transition-colors duration-fast hover:text-ivory"
        >
          Back to Home
        </Link>
      </div>
      <p className="mx-auto mt-3 max-w-xl text-center font-body text-xs text-desert-sand/70 print:hidden">
        &ldquo;Download Pass&rdquo; saves a demo copy as an HTML file — a printable pass design
        will be available once backend integration is complete.
      </p>
    </SectionContainer>
  );
}
