import type { AffinityEvent, EventCategory } from "@/types/event";
import { sportsEvents } from "./sports";
import { culturalOnstageEvents, culturalOffstageEvents } from "./cultural";
import { onlineCulturalEvents, onlineEsportsEvents } from "./online";

export { sportsEvents } from "./sports";
export { culturalOnstageEvents, culturalOffstageEvents } from "./cultural";
export { onlineCulturalEvents, onlineEsportsEvents } from "./online";

/** Every AFFINITY '26 event, across every category. This is the single array the Events Explorer, registration wizard, and pricing calculator all read from. */
export const allEvents: AffinityEvent[] = [
  ...sportsEvents,
  ...culturalOnstageEvents,
  ...culturalOffstageEvents,
  ...onlineCulturalEvents,
  ...onlineEsportsEvents,
];

export const eventsByCategory: Record<EventCategory, AffinityEvent[]> = {
  sports: sportsEvents,
  "cultural-onstage": culturalOnstageEvents,
  "cultural-offstage": culturalOffstageEvents,
  "online-cultural": onlineCulturalEvents,
  "online-esports": onlineEsportsEvents,
};

export function getEventById(id: string): AffinityEvent | undefined {
  return allEvents.find((event) => event.id === id);
}

export function getEventsByCategory(category: EventCategory): AffinityEvent[] {
  return eventsByCategory[category];
}

/** Convenience count used by placeholder landing-page copy (Phase 02) — swap for richer stats once the design system (Phase 03) lands. */
export const eventCounts = {
  total: allEvents.length,
  sports: sportsEvents.length,
  culturalOnstage: culturalOnstageEvents.length,
  culturalOffstage: culturalOffstageEvents.length,
  onlineCultural: onlineCulturalEvents.length,
  onlineEsports: onlineEsportsEvents.length,
};
