export const STORAGE_KEY = "ml-journey-tracker-v1";
export const THEME_KEY = "ml-journey-theme";
export const TAB_KEY = "ml-journey-tab";
export const PHASE_KEY = "ml-journey-active-phase";

export const ROUTE_IDS = [
  "dashboard",
  "phases",
  "job",
  "costs",
  "resources",
  "risks",
  "routine",
] as const;

export type RouteId = (typeof ROUTE_IDS)[number];

export function isRouteId(s: string | undefined | null): s is RouteId {
  return !!s && (ROUTE_IDS as readonly string[]).includes(s);
}
