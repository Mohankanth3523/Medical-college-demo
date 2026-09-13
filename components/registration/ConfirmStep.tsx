"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegistration } from "@/lib/registration/context";
import { PricingBreakdown } from "@/components/registration/PricingBreakdown";
import { GoldButton, SecondaryButton, OrnamentalFrame } from "@/components/design-system";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

type ConfirmPhase = "summary" | "demo-payment";

/**
 * Step 06 — Confirm. This is a FRONTEND-ONLY payment demonstration, per
 * the project brief's own PAYMENT section: no Razorpay call, no API
 * route, no real transaction of any kind. The step is two local phases
 * (plain `useState`, not wizard/reducer state — this is purely
 * within-step UI navigation, the same reasoning `EventsStep`'s search/
 * filter state already uses):
 *
 * 1. "summary" — the registration amount and its line-item breakdown
 *    (the exact same `PricingBreakdown` component `PackageStep`/
 *    `ReviewStep` already use, so the number here can never drift from
 *    what the participant already reviewed), gated behind the "Continue
 *    to Payment" CTA by `state.review.acceptedTerms` — a defensive check
 *    for a participant who reached Confirm by jumping directly via
 *    `RegistrationProgress`'s step indicator rather than Review's own
 *    "Proceed" gate.
 * 2. "demo-payment" — the brief's own "DEMO PAYMENT — FRONTEND ONLY"
 *    screen: a plain-language statement that no real payment is
 *    processed and that real payment integration is future backend work,
 *    and a single simulated-success action. No payment ID of any kind is
 *    generated or shown here — `CONFIRM_REGISTRATION`'s own mock
 *    registration ID (already clearly formatted "AFF26-DEMO-XXXXXX",
 *    unchanged since Phase 02) is the only identifier this flow ever
 *    produces, and it's a *registration* record, not a claimed payment
 *    transaction.
 *
 * On simulated success this now routes to the real top-level `/success`
 * page (Phase 18, `app/success/page.tsx` + `components/success/
 * RegistrationPass.tsx`) — Phase 17 originally kept the old
 * `/register/success` placeholder route since building the real success
 * page was out of that phase's scope; Phase 18 built it at the literal
 * `/success` path the brief names, giving it its own `RegistrationProvider`
 * so it isn't dependent on `/register/**`. `/register/success` itself now
 * just redirects here — see docs/phase-18-success-page-notes.md.
 */
export function ConfirmStep() {
  const { state, dispatch } = useRegistration();
  const router = useRouter();
  const [phase, setPhase] = useState<ConfirmPhase>("summary");

  function handleDemoSuccess() {
    dispatch({ type: "CONFIRM_REGISTRATION" });
    // Phase 18: the real success/pass experience now lives at the
    // top-level /success route (components/success/RegistrationPass.tsx),
    // not /register/success (that path now just redirects here — see
    // app/register/success/page.tsx).
    router.push("/success");
  }

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-2xl font-semibold tracking-wide text-ivory">The Final Seal</h3>
        <p className="font-accent text-base italic text-warm-gold">
          One gesture stands between you and the gates of AFFINITY &apos;26.
        </p>
      </div>

      {phase === "summary" && (
        <div className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand">
              Registration Amount
            </span>
            <span className="font-display text-4xl font-semibold text-antique-gold">
              {state.pricing ? formatRupees(state.pricing.total) : "₹0"}
            </span>
          </div>

          <PricingBreakdown pricing={state.pricing} heading="Payment Summary" />

          <div className="flex flex-col items-end gap-2">
            <GoldButton
              type="button"
              disabled={!state.review.acceptedTerms}
              onClick={() => setPhase("demo-payment")}
            >
              Continue to Payment
            </GoldButton>
            {!state.review.acceptedTerms && (
              <p role="status" className="font-body text-xs text-desert-sand">
                Accept the AFFINITY &apos;26 terms and conditions on the Review step first.
              </p>
            )}
          </div>
        </div>
      )}

      {phase === "demo-payment" && (
        <div className="mt-6 flex flex-col gap-6">
          <OrnamentalFrame padding="md" className="ring-1 ring-warm-gold">
            <p className="font-display text-lg font-semibold tracking-wide text-warm-gold">
              Demo Payment — Frontend Only
            </p>
            <p className="mt-3 font-body text-sm text-ivory">
              No real payment is being processed. This screen simulates what a payment step will
              look like once the site is connected to a real payment gateway.
            </p>
            <p className="mt-2 font-body text-sm text-desert-sand">
              Payment integration will be connected during backend integration.
            </p>
            <p className="mt-2 font-body text-xs text-desert-sand/80">
              No payment ID is generated by this demo. The confirmation screen that follows shows
              a mock registration record only — never a real transaction reference.
            </p>
          </OrnamentalFrame>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <SecondaryButton type="button" onClick={() => setPhase("summary")}>
              Back to Summary
            </SecondaryButton>
            <GoldButton type="button" onClick={handleDemoSuccess}>
              Simulate Successful Payment (Demo)
            </GoldButton>
          </div>
          <p className="font-body text-xs text-desert-sand/80">
            Development preview only — this button does not contact any payment provider.
          </p>
        </div>
      )}
    </div>
  );
}
