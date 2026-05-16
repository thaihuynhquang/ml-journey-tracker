import { resetScheduleDefaults } from "../actions/backup";
import { PLAN_DATA } from "../data/planData";
import {
  getAllTaskIds,
  getCalendarWeeksNeeded,
  getCheckpointProgress,
  getCompletedCount,
  getCurrentPhase,
  getCurrentWeek,
  getPhaseProgress,
  getProjectedEndDate,
  getWeeklyHours,
} from "../progress";
import { goToPhasesWithPhase } from "../router";
import { saveState, state } from "../state/storage";
import { escapeHtml } from "../utils/html";
import { formatDate } from "../utils/format";
import { renderAll } from "../renderer";

export class MlViewDashboard extends HTMLElement {
  refresh(): void {
    const allIds = getAllTaskIds();
    const done = getCompletedCount(allIds);
    const total = allIds.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const currentWeek = getCurrentWeek();
    const currentPhase = getCurrentPhase();
    const passedCheckpoints = PLAN_DATA.phases.filter(
      (p) => p.checkpoint && getCheckpointProgress(p.checkpoint).passed
    ).length;
    const weeklyHours = getWeeklyHours();
    const calendarWeeks = getCalendarWeeksNeeded();
    const projectedEnd = getProjectedEndDate();
    const restDays = 7 - state.daysPerWeek;

    const phaseCards = PLAN_DATA.phases
      .map((phase) => {
        const prog = getPhaseProgress(phase);
        const pctPhase = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
        const isCurrent = phase.id === currentPhase.id;
        return `
          <div class="card phase-overview-card ${isCurrent ? "current-week-card" : ""}" style="--phase-color: ${phase.color}" data-phase-id="${phase.id}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <h3>${escapeHtml(phase.title)}</h3>
              ${isCurrent ? '<span class="current-badge">Current</span>' : ""}
            </div>
            <p class="subtitle">${escapeHtml(phase.subtitle)}</p>
            <div class="phase-meta">
              <span>📅 ${escapeHtml(phase.weekRange)}</span>
              <span>⏱ ${phase.hours}h</span>
            </div>
            <div class="progress-label"><strong>${prog.done}/${prog.total}</strong><span>${pctPhase}%</span></div>
            <div class="progress-bar"><div class="progress-bar-fill ${pctPhase === 100 ? "success" : ""}" style="width:${pctPhase}%"></div></div>
          </div>
        `;
      })
      .join("");

    const timelineItems = PLAN_DATA.successCriteria
      .map((sc) => {
        const isDone = sc.week <= currentWeek;
        return `
          <div class="timeline-item ${isDone ? "done" : ""}">
            <h4>${escapeHtml(sc.milestone)}</h4>
            <div class="week">Tuần ${sc.week}</div>
            <div class="cond">${escapeHtml(sc.condition)}</div>
          </div>
        `;
      })
      .join("");

    this.innerHTML = `
      <div class="hero">
        <h2>${escapeHtml(PLAN_DATA.meta.title)}</h2>
        <p>${escapeHtml(PLAN_DATA.meta.subtitle)}</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="label">Overall Progress</div>
            <div class="value">${pct}%</div>
            <div class="sub">${done}/${total} tasks</div>
          </div>
          <div class="hero-stat">
            <div class="label">Current Week</div>
            <div class="value">Tuần ${currentWeek}</div>
            <div class="sub">/${PLAN_DATA.meta.totalWeeks} tuần</div>
          </div>
          <div class="hero-stat">
            <div class="label">Current Phase</div>
            <div class="value" style="font-size:1.1rem;line-height:1.4;">${escapeHtml(currentPhase.title.replace("Phase ", "P"))}</div>
            <div class="sub">${escapeHtml(currentPhase.subtitle)}</div>
          </div>
          <div class="hero-stat">
            <div class="label">Checkpoints</div>
            <div class="value">${passedCheckpoints}/${PLAN_DATA.phases.length}</div>
            <div class="sub">đã pass</div>
          </div>
          <div class="hero-stat">
            <div class="label">Cường độ</div>
            <div class="value" style="font-size:1.2rem;line-height:1.4;">${weeklyHours}h/tuần</div>
            <div class="sub">${state.dailyHours}h × ${state.daysPerWeek} ngày</div>
          </div>
        </div>
      </div>

      <div class="card schedule-settings">
        <h3>Cài đặt lịch học</h3>
        <div class="schedule-grid">
          <div class="schedule-field">
            <label for="start-date">Ngày bắt đầu</label>
            <input type="date" id="start-date" value="${escapeHtml(state.startDate)}" />
          </div>
          <div class="schedule-field">
            <label for="daily-hours">Giờ học mỗi ngày</label>
            <input type="number" id="daily-hours" min="1" max="12" step="0.5" value="${state.dailyHours}" />
          </div>
          <div class="schedule-field">
            <label for="days-per-week">Ngày học / tuần</label>
            <select id="days-per-week">
              ${[3, 4, 5, 6, 7]
                .map(
                  (d) =>
                    `<option value="${d}" ${d === state.daysPerWeek ? "selected" : ""}>${d} ngày</option>`
                )
                .join("")}
            </select>
          </div>
        </div>
        <div class="schedule-summary">
          <span><strong>${weeklyHours}h</strong> / tuần</span>
          <span><strong>${calendarWeeks}</strong> tuần lịch (≈ ${PLAN_DATA.meta.totalHours}h curriculum)</span>
          <span>Dự kiến xong: <strong>${formatDate(projectedEnd)}</strong></span>
          <span>${state.daysPerWeek} ngày học + <strong>${restDays}</strong> ngày nghỉ</span>
        </div>
        <button type="button" class="schedule-reset-btn" id="schedule-reset-btn">Quay lại mặc định</button>
      </div>

      <div class="card-section-title">Phases Overview</div>
      <div class="grid">${phaseCards}</div>

      <div class="card-section-title">Success Criteria Timeline</div>
      <div class="card">
        <div class="timeline">${timelineItems}</div>
      </div>
    `;

    this.querySelectorAll(".phase-overview-card").forEach((el) => {
      el.addEventListener("click", () => {
        const id = (el as HTMLElement).dataset.phaseId;
        if (id) goToPhasesWithPhase(id);
      });
    });

    const startDateEl = document.getElementById("start-date");
    const dailyHoursEl = document.getElementById("daily-hours");
    const daysPerWeekEl = document.getElementById("days-per-week");
    const scheduleResetEl = document.getElementById("schedule-reset-btn");

    startDateEl?.addEventListener("change", (e) => {
      const t = e.target as HTMLInputElement;
      if (!t.value) return;
      state.startDate = t.value;
      saveState();
      renderAll();
    });

    dailyHoursEl?.addEventListener("change", (e) => {
      const t = e.target as HTMLInputElement;
      const val = parseFloat(t.value);
      if (!val || val < 1) return;
      state.dailyHours = Math.min(12, val);
      saveState();
      renderAll();
    });

    daysPerWeekEl?.addEventListener("change", (e) => {
      const t = e.target as HTMLSelectElement;
      state.daysPerWeek = parseInt(t.value, 10);
      saveState();
      renderAll();
    });

    scheduleResetEl?.addEventListener("click", resetScheduleDefaults);
  }
}

customElements.define("ml-view-dashboard", MlViewDashboard);
