import { exportProgress, importProgress, resetProgress } from "./actions/backup";
import { isRouteId, THEME_KEY } from "./constants";
import {
  hashForRoute,
  initRouter,
  syncInitialHashFromStorage,
  switchTabVisual,
} from "./router";
import { renderAll, setRenderAll } from "./renderer";
import { normalizeState } from "./state/storage";
import { formatToday } from "./utils/format";

import "./styles/main.css";
import "./views/ml-view-costs";
import "./views/ml-view-dashboard";
import "./views/ml-view-job";
import "./views/ml-view-phases";
import "./views/ml-view-resources";
import "./views/ml-view-risks";
import "./views/ml-view-routine";

function viewEl(id: string): (HTMLElement & { refresh(): void }) | null {
  const el = document.getElementById(id);
  if (el && typeof (el as unknown as { refresh?: () => void }).refresh === "function") {
    return el as HTMLElement & { refresh(): void };
  }
  return null;
}

setRenderAll(() => {
  [
    "view-dashboard",
    "view-phases",
    "view-job",
    "view-costs",
    "view-resources",
    "view-risks",
    "view-routine",
  ].forEach((id) => viewEl(id)?.refresh());
});

function applyTheme(theme: string): void {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme(): void {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(current === "light" ? "dark" : "light");
}

function init(): void {
  normalizeState();

  const savedTheme =
    localStorage.getItem(THEME_KEY) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(savedTheme);

  const badge = document.getElementById("today-badge");
  if (badge) badge.textContent = formatToday();

  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
  document.getElementById("export-btn")?.addEventListener("click", exportProgress);
  document.getElementById("import-input")?.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.files?.[0]) importProgress(t.files[0]);
    t.value = "";
  });
  document.getElementById("reset-btn")?.addEventListener("click", resetProgress);

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = (tab as HTMLElement).dataset.tab;
      if (!isRouteId(id)) return;
      if (location.hash !== hashForRoute(id)) location.hash = hashForRoute(id);
      else switchTabVisual(id);
    });
  });

  initRouter();

  const initial = syncInitialHashFromStorage();
  switchTabVisual(initial);

  renderAll();
}

init();
