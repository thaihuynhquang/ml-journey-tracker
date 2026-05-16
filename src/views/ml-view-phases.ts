import { PLAN_DATA } from "../data/planData";
import { PHASE_KEY } from "../constants";
import {
  getCheckpointProgress,
  getPhaseProgress,
  getWeekProgress,
  isChecked,
  toggleTask,
} from "../progress";
import { renderAll } from "../renderer";
import { escapeHtml } from "../utils/html";

export class MlViewPhases extends HTMLElement {
  refresh(): void {
    const activePhaseId = localStorage.getItem(PHASE_KEY) || PLAN_DATA.phases[0].id;
    const activePhase = PLAN_DATA.phases.find((p) => p.id === activePhaseId) || PLAN_DATA.phases[0];

    const phaseNav = PLAN_DATA.phases
      .map((p) => {
        const prog = getPhaseProgress(p);
        const pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
        return `
          <button class="phase-nav-btn ${p.id === activePhase.id ? "active" : ""}" data-phase-id="${p.id}">
            <span class="pnb-title">${escapeHtml(p.title)}</span>
            <span class="pnb-meta">${escapeHtml(p.weekRange)} · ${pct}%</span>
          </button>
        `;
      })
      .join("");

    const weeksHtml = activePhase.weeks
      .map((week) => {
        const prog = getWeekProgress(week);
        const pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
        const materialsHtml = week.materials.length
          ? `<div class="section-label">Tài liệu</div>
             <ul class="materials-list">${week.materials
               .map((m) => `<li><a href="${escapeHtml(m.url)}" target="_blank" rel="noopener">${escapeHtml(m.label)}</a></li>`)
               .join("")}</ul>`
          : "";
        const tasksHtml = week.tasks
          .map((t) => {
            const checked = isChecked(t.id);
            return `
              <li class="task-item ${checked ? "checked" : ""}">
                <input type="checkbox" class="task-checkbox" id="${t.id}" data-task-id="${t.id}" ${checked ? "checked" : ""} />
                <label for="${t.id}" class="task-label">${escapeHtml(t.label)}</label>
              </li>
            `;
          })
          .join("");
        return `
          <div class="week-card" data-week-id="${week.id}">
            <div class="week-header">
              <div class="week-title">
                <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                <h3>${escapeHtml(week.title)}</h3>
              </div>
              <div class="week-meta">
                <span>${prog.done}/${prog.total}</span>
                <div style="width:80px;"><div class="progress-bar"><div class="progress-bar-fill ${pct === 100 ? "success" : ""}" style="width:${pct}%"></div></div></div>
              </div>
            </div>
            <div class="week-body">
              <div class="section-label">Tasks</div>
              <ul class="task-list">${tasksHtml}</ul>
              ${materialsHtml}
              ${week.deliverable ? `<div class="deliverable"><strong>Deliverable</strong>${escapeHtml(week.deliverable)}</div>` : ""}
            </div>
          </div>
        `;
      })
      .join("");

    const cp = activePhase.checkpoint;
    const cpProg = cp ? getCheckpointProgress(cp) : null;
    const checkpointHtml =
      cp && cpProg
        ? `
        <div class="checkpoint-card ${cpProg.passed ? "passed" : ""}">
          <div class="checkpoint-header">
            <h3>${cpProg.passed ? "✅" : "⚡"} ${escapeHtml(cp.title)}</h3>
            <span class="pass-rule">${escapeHtml(cp.passRule)} · ${cpProg.done}/${cpProg.total}</span>
          </div>
          <ul class="task-list">
            ${cp.criteria
              .map((c) => {
                const checked = isChecked(c.id);
                return `
                  <li class="task-item ${checked ? "checked" : ""}">
                    <input type="checkbox" class="task-checkbox" id="${c.id}" data-task-id="${c.id}" ${checked ? "checked" : ""} />
                    <label for="${c.id}" class="task-label">${escapeHtml(c.label)}</label>
                  </li>
                `;
              })
              .join("")}
          </ul>
          <div class="fallback-section">
            <h4>Nếu FAIL — Fallback path:</h4>
            ${cp.fallbacks
              .map(
                (f) => `
                <div class="fallback-item">
                  <div class="failure">⚠ ${escapeHtml(f.failure)}</div>
                  <div class="action">→ ${escapeHtml(f.action)}</div>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `
        : "";

    this.innerHTML = `
      <div class="phase-nav">${phaseNav}</div>
      <div class="phase-header">
        <h2>${escapeHtml(activePhase.title)}</h2>
        <p class="subtitle">${escapeHtml(activePhase.subtitle)} · ${escapeHtml(activePhase.weekRange)} · ${activePhase.hours}h</p>
      </div>
      ${weeksHtml}
      ${checkpointHtml}
    `;

    this.querySelectorAll(".phase-nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.phaseId;
        if (id) {
          localStorage.setItem(PHASE_KEY, id);
          this.refresh();
        }
      });
    });

    this.querySelectorAll(".week-header").forEach((h) => {
      h.addEventListener("click", () => h.parentElement?.classList.toggle("open"));
    });

    this.querySelectorAll(".task-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const t = e.target as HTMLInputElement;
        const id = t.dataset.taskId;
        if (id) toggleTask(id);
        renderAll();
      });
    });

    if (activePhase.weeks.length > 0) {
      const firstWeek = this.querySelector(`[data-week-id="${activePhase.weeks[0].id}"]`);
      firstWeek?.classList.add("open");
    }
  }
}

customElements.define("ml-view-phases", MlViewPhases);
