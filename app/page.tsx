import { Hero } from "@/components/hero/Hero";
import { Story } from "@/components/sections/Story";
import { Theme } from "@/components/sections/Theme";
import { Cause } from "@/components/sections/Cause";
import { EventsTeaser } from "@/components/sections/EventsTeaser";
import { CinematicIntro } from "@/components/intro/CinematicIntro";

/**
 * Landing page.
 *
 * Every section here is now a real, built component — Hero (Phase 06),
 * Story (Phase 07), Theme (Phase 23), Cause (Phase 08, restructured in
 * Phase 24), and the Events teaser (Phase 25) — none of the Phase 02
 * placeholder markup remains. Each section owns its own data imports
 * rather than the page importing on their behalf.
 *
 * Phase 28: `CinematicIntro` mounts first, deliberately only here and
 * nowhere else in the app — see its own doc comment for why that alone is
 * what makes "play once per session, never again on other routes" true
 * without any route-level logic. It's `position: fixed`, so its presence
 * here doesn't shift `Hero` or anything below it in the document flow.
 */
export default function LandingPage() {
  return (
    <div>
      <CinematicIntro />

      <Hero />

      <Story />

      <Theme />

      <Cause />

      <EventsTeaser />
    </div>
  );
}
