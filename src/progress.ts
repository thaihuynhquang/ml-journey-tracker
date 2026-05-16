import { PLAN_DATA } from "./data/planData";
import { saveState, state } from "./state/storage";

export function toggleTask(id: string): void {
  state.checked[id] = !state.checked[id];
  saveState();
}

export function isChecked(id: string): boolean {
  return !!state.checked[id];
}

export function getAllTaskIds(): string[] {
  const ids: string[] = [];
  PLAN_DATA.phases.forEach((p) => {
    p.weeks.forEach((w) => {
      w.tasks.forEach((t) => ids.push(t.id));
    });
    if (p.checkpoint) {
      p.checkpoint.criteria.forEach((c) => ids.push(c.id));
    }
  });
  PLAN_DATA.jobHunt.tasks.forEach((t) => ids.push(t.id));
  return ids;
}

export function getCompletedCount(ids: string[]): number {
  return ids.filter((id) => isChecked(id)).length;
}

export function getPhaseProgress(phase: (typeof PLAN_DATA.phases)[number]): {
  total: number;
  done: number;
} {
  const ids: string[] = [];
  phase.weeks.forEach((w) => w.tasks.forEach((t) => ids.push(t.id)));
  if (phase.checkpoint) phase.checkpoint.criteria.forEach((c) => ids.push(c.id));
  return { total: ids.length, done: getCompletedCount(ids) };
}

export function getWeekProgress(week: (typeof PLAN_DATA.phases)[number]["weeks"][number]): {
  total: number;
  done: number;
} {
  const total = week.tasks.length;
  const done = week.tasks.filter((t) => isChecked(t.id)).length;
  return { total, done };
}

export function getCheckpointProgress(checkpoint: NonNullable<
  (typeof PLAN_DATA.phases)[number]["checkpoint"]
>): { total: number; done: number; passed: boolean } {
  const total = checkpoint.criteria.length;
  const done = checkpoint.criteria.filter((c) => isChecked(c.id)).length;
  const passNum = parseInt((checkpoint.passRule.match(/(\d+)\/(\d+)/) || [])[1] || String(total), 10);
  return { total, done, passed: done >= passNum };
}

export function getCurrentWeek(): number {
  const start = new Date(state.startDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = +today - +start;
  const weekNum = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, Math.min(weekNum, PLAN_DATA.meta.totalWeeks));
}

export function getWeeklyHours(): number {
  return state.dailyHours * state.daysPerWeek;
}

export function getCalendarWeeksNeeded(): number {
  const weekly = getWeeklyHours();
  if (!weekly) return PLAN_DATA.meta.totalWeeks;
  return Math.ceil(PLAN_DATA.meta.totalHours / weekly);
}

export function getProjectedEndDate(): Date {
  const start = new Date(state.startDate + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + getCalendarWeeksNeeded() * 7);
  return end;
}

export function getCurrentPhase(): (typeof PLAN_DATA.phases)[number] {
  const week = getCurrentWeek();
  const found = PLAN_DATA.phases.find((p) => {
    const m = p.weekRange.match(/(\d+)-(\d+)/);
    if (!m) return false;
    const start = Number(m[1]);
    const end = Number(m[2]);
    return week >= start && week <= end;
  });
  return found || PLAN_DATA.phases[0];
}
