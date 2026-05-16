import { PLAN_DATA } from "../data/planData";
import type { AppState } from "../types/appState";
import { STORAGE_KEY } from "../constants";

export let state: AppState = loadState();

export function defaultState(): AppState {
  return {
    checked: {},
    notes: {},
    resourceUserFlags: {},
    startDate: PLAN_DATA.meta.startDate,
    dailyHours: PLAN_DATA.meta.dailyHours,
    daysPerWeek: PLAN_DATA.meta.daysPerWeek,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

export function normalizeState(): void {
  if (typeof state.dailyHours !== "number" || state.dailyHours < 1) {
    state.dailyHours = PLAN_DATA.meta.dailyHours;
  }
  if (typeof state.daysPerWeek !== "number" || state.daysPerWeek < 1) {
    state.daysPerWeek = PLAN_DATA.meta.daysPerWeek;
  }
  if (!state.resourceUserFlags || typeof state.resourceUserFlags !== "object") {
    state.resourceUserFlags = {};
  }
}

export function saveState(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
