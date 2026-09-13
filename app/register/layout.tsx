import type { ReactNode } from "react";
import { RegistrationProvider } from "@/lib/registration/context";

/** Everything under /register shares one RegistrationProvider so wizard state survives step-to-step navigation. */
export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <RegistrationProvider>{children}</RegistrationProvider>;
}
