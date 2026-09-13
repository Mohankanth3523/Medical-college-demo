import { Hero } from "@/components/hero/Hero";
import { Story } from "@/components/sections/Story";
import { Theme } from "@/components/sections/Theme";
import { Cause } from "@/components/sections/Cause";
import { EventsTeaser } from "@/components/sections/EventsTeaser";

/**
 * Landing page.
 *
 * Every section here is now a real, built component — Hero (Phase 06),
 * Story (Phase 07), Theme (Phase 23), Cause (Phase 08, restructured in
 * Phase 24), and the Events teaser (Phase 25) — none of the Phase 02
 * placeholder markup remains. Each section owns its own data imports
 * rather than the page importing on their behalf.
 */
export default function LandingPage() {
  return (
    <div>
      <Hero />

      <Story />

      <Theme />

      <Cause />

      <EventsTeaser />
    </div>
  );
}
