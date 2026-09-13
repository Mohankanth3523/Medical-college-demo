"use client";

import { Suspense } from "react";
import { useRegistration } from "@/lib/registration/context";
import { EventPreselect } from "@/components/registration/EventPreselect";
import { RegistrationLayout } from "@/components/registration/RegistrationLayout";
import { RegistrationProgress } from "@/components/registration/RegistrationProgress";
import { RegistrationStep } from "@/components/registration/RegistrationStep";
import { RegistrationSummary } from "@/components/registration/RegistrationSummary";
import { RegistrationNavigation } from "@/components/registration/RegistrationNavigation";
import { ParticipantStep } from "@/components/registration/ParticipantStep";
import { EventsStep } from "@/components/registration/EventsStep";
import { DetailsStep } from "@/components/registration/DetailsStep";
import { PackageStep } from "@/components/registration/PackageStep";
import { ReviewStep } from "@/components/registration/ReviewStep";
import { ConfirmStep } from "@/components/registration/ConfirmStep";

/**
 * PHASE 11 registration wizard shell. The reducer/pricing/persistence
 * wiring (RegistrationProvider — app/register/layout.tsx) is unchanged
 * from Phase 02; this phase replaces the plain WizardNav scaffold with
 * the five reusable architecture components: RegistrationLayout (outer
 * shell), RegistrationProgress (step indicator), RegistrationStep (the
 * "royal registry" frame around whichever step is active),
 * RegistrationSummary (the running sidebar snapshot), and
 * RegistrationNavigation (Back/Next).
 *
 * Per the phase brief, step *content* itself is untouched — all six step
 * components below are exactly the plain, unstyled Phase 02 forms; only
 * the architecture around them is new. `<EventPreselect />` (Phase 10)
 * still needs its own `<Suspense>` boundary for `useSearchParams()`.
 */
export default function RegisterPage() {
  const { state } = useRegistration();

  return (
    <RegistrationLayout
      progress={<RegistrationProgress />}
      summary={<RegistrationSummary />}
    >
      <Suspense fallback={null}>
        <EventPreselect />
      </Suspense>

      <RegistrationStep step={state.step}>
        {state.step === "participant" && <ParticipantStep />}
        {state.step === "events" && <EventsStep />}
        {state.step === "details" && <DetailsStep />}
        {state.step === "package" && <PackageStep />}
        {state.step === "review" && <ReviewStep />}
        {state.step === "confirm" && <ConfirmStep />}
      </RegistrationStep>

      <RegistrationNavigation />
    </RegistrationLayout>
  );
}
