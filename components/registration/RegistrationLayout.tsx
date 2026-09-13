import type { ReactNode } from "react";
import { SectionContainer } from "@/components/design-system";

export interface RegistrationLayoutProps {
  progress: ReactNode;
  summary: ReactNode;
  children: ReactNode;
}

/**
 * Phase 11: the outer shell for `/register` — heading, then the progress
 * indicator, then a two-column body (step content + nav on the left, the
 * running summary as an aside on the right) that collapses to a single
 * stacked column below `lg`. Natural DOM order already puts the summary
 * after the main column, so mobile stacking needs no reordering classes.
 *
 * Purely presentational — no `useRegistration()` call here. Every piece
 * that needs wizard state (`RegistrationProgress`, `RegistrationSummary`,
 * the step content, `RegistrationNavigation`) is passed in already built,
 * so this component stays reusable even if `/register` ever needed a
 * second entry point with different content in the same shell.
 */
export function RegistrationLayout({ progress, summary, children }: RegistrationLayoutProps) {
  return (
    <SectionContainer as="div" width="wide" verticalPadding>
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-wide text-ivory sm:text-5xl lg:text-6xl">
          The Royal Registry
        </h1>
        <p className="font-accent text-lg italic text-warm-gold sm:text-xl">
          Your tale has begun. Complete it below.
        </p>
      </div>

      <div className="mt-10 sm:mt-12">{progress}</div>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>{children}</div>
        <div className="lg:mt-8">{summary}</div>
      </div>
    </SectionContainer>
  );
}
