import { PLAN_DATA } from "../data/planData";
import { isChecked, toggleTask } from "../progress";
import { renderAll } from "../renderer";
import { escapeHtml } from "../utils/html";

export class MlViewJob extends HTMLElement {
  refresh(): void {
    const jh = PLAN_DATA.jobHunt;
    const total = jh.tasks.length;
    const done = jh.tasks.filter((t) => isChecked(t.id)).length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    this.innerHTML = `
      <div class="phase-header">
        <h2>Job Hunt</h2>
        <p class="subtitle">Bắt đầu song song từ tuần ${jh.startWeek} — quan trọng nhất vì goal là JOB</p>
      </div>

      <div class="card">
        <div class="progress-label"><strong>Progress: ${done}/${total}</strong><span>${pct}%</span></div>
        <div class="progress-bar"><div class="progress-bar-fill ${pct === 100 ? "success" : ""}" style="width:${pct}%"></div></div>
      </div>

      <div class="card-section-title">Target Roles (theo thứ tự match)</div>
      <div class="role-grid">
        ${jh.targetRoles
          .map(
            (r, i) => `
            <div class="role-item">
              <h4>${i + 1}. ${escapeHtml(r.title)}</h4>
              <p>${escapeHtml(r.fit)}</p>
            </div>
          `
          )
          .join("")}
      </div>

      <div class="card-section-title">KHÔNG apply</div>
      <div class="avoid-list">
        ${jh.avoid.map((a) => `<span class="avoid-chip">${escapeHtml(a)}</span>`).join("")}
      </div>

      <div class="card-section-title">Niche / USP</div>
      <div class="card">
        <p>${escapeHtml(jh.niche)}</p>
      </div>

      <div class="card-section-title">Action Items</div>
      <div class="card">
        <ul class="task-list">
          ${jh.tasks
            .map((t) => {
              const checked = isChecked(t.id);
              return `
                <li class="task-item ${checked ? "checked" : ""}">
                  <input type="checkbox" class="task-checkbox" id="${t.id}" data-task-id="${t.id}" ${checked ? "checked" : ""} />
                  <label for="${t.id}" class="task-label">${escapeHtml(t.label)}</label>
                </li>
              `;
            })
            .join("")}
        </ul>
      </div>
    `;

    this.querySelectorAll(".task-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const t = e.target as HTMLInputElement;
        const id = t.dataset.taskId;
        if (id) toggleTask(id);
        renderAll();
      });
    });
  }
}

customElements.define("ml-view-job", MlViewJob);
