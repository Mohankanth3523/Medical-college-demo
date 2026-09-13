import type { EventCategory } from "@/types/event";

/**
 * The shared three-way UI grouping — Sports / Culturals / Online — used
 * everywhere events are filtered by category (the public Events Explorer,
 * Phase 09; the registration wizard's Events step, Phase 13). Coarser
 * than `EventCategory`'s five values. This is a navigation/UI taxonomy,
 * not a sourced fact, so it lives here rather than in `data/events/`
 * alongside the real event records — same reasoning `EventsExplorer`'s
 * original doc comment gave when this lived only in that one file.
 *
 * Extracted to its own module in Phase 13 once a second consumer
 * (`EventsStep`) needed the identical grouping — duplicating three
 * consts across two files would have been worse than the one extra
 * import.
 */
export type EventGroup = "all" | "sports" | "culturals" | "online";

export const EVENT_GROUPS: EventGroup[] = ["all", "sports", "culturals", "online"];

export const EVENT_GROUP_LABEL: Record<EventGroup, string> = {
  all: "All Events",
  sports: "Sports",
  culturals: "Culturals",
  online: "Online",
};

export const EVENT_GROUP_CATEGORIES: Record<Exclude<EventGroup, "all">, EventCategory[]> = {
  sports: ["sports"],
  culturals: ["cultural-onstage", "cultural-offstage"],
  online: ["online-cultural", "online-esports"],
};
