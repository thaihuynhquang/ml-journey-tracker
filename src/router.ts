import { PHASE_KEY, TAB_KEY, type RouteId, isRouteId } from "./constants";
import { renderAll } from "./renderer";

function tabElements(): NodeListOf<HTMLButtonElement> {
  return document.querySelectorAll<HTMLButtonElement>(".tab");
}

function viewElements(): NodeListOf<HTMLElement> {
  return document.querySelectorAll<HTMLElement>(".view");
}

export function switchTabVisual(tabId: RouteId): void {
  tabElements().forEach((t) => t.classList.toggle("active", t.dataset.tab === tabId));
  viewElements().forEach((v) => v.classList.toggle("active", v.id === "view-" + tabId));
  localStorage.setItem(TAB_KEY, tabId);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function parseHashRoute(): RouteId | null {
  const raw = location.hash.replace(/^#\/?/, "").trim();
  if (!raw) return null;
  const id = raw.split("/")[0];
  return isRouteId(id) ? id : null;
}

export function hashForRoute(tabId: RouteId): string {
  return `#/${tabId}`;
}

export function syncInitialHashFromStorage(): RouteId {
  const fromHash = parseHashRoute();
  if (fromHash) return fromHash;
  const saved = localStorage.getItem(TAB_KEY);
  const tab: RouteId = isRouteId(saved) ? saved : "dashboard";
  history.replaceState(null, "", hashForRoute(tab));
  return tab;
}

export function initRouter(): void {
  window.addEventListener("hashchange", () => {
    const id = parseHashRoute();
    if (id) switchTabVisual(id);
  });
}

export function goToPhasesWithPhase(phaseId: string): void {
  localStorage.setItem(PHASE_KEY, phaseId);
  switchTabVisual("phases");
  if (location.hash !== hashForRoute("phases")) {
    location.hash = hashForRoute("phases");
  }
  renderAll();
}
