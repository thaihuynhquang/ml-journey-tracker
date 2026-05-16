import { PLAN_DATA } from "../data/planData";
import { defaultState, normalizeState, saveState, state } from "../state/storage";
import type { AppState } from "../types/appState";
import { STORAGE_KEY } from "../constants";
import { renderAll } from "../renderer";
import { showToast } from "../toast";

export function resetScheduleDefaults(): void {
  state.startDate = PLAN_DATA.meta.startDate;
  state.dailyHours = PLAN_DATA.meta.dailyHours;
  state.daysPerWeek = PLAN_DATA.meta.daysPerWeek;
  saveState();
  renderAll();
  showToast("Đã đặt lại lịch học mặc định");
}

export function exportProgress(): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ml-journey-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Đã export progress");
}

export function importProgress(file: File): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = typeof e.target?.result === "string" ? e.target.result : "";
      const imported = JSON.parse(text) as Partial<AppState>;
      Object.assign(state, imported);
      normalizeState();
      saveState();
      renderAll();
      showToast("Đã import progress");
    } catch {
      showToast("File không hợp lệ");
    }
  };
  reader.readAsText(file);
}

export function resetProgress(): void {
  if (!confirm("Bạn chắc muốn reset toàn bộ progress? Hành động này không thể undo.")) return;
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, defaultState());
  renderAll();
  showToast("Đã reset progress");
}
