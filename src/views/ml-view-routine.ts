import { PLAN_DATA } from "../data/planData";
import { getWeeklyHours } from "../progress";
import { state } from "../state/storage";
import { escapeHtml } from "../utils/html";

export class MlViewRoutine extends HTMLElement {
  refresh(): void {
    this.innerHTML = `
      <div class="phase-header">
        <h2>Weekly Routine</h2>
        <p class="subtitle">${state.dailyHours}h/ngày, ${state.daysPerWeek} ngày học + ${7 - state.daysPerWeek} ngày nghỉ · ${getWeeklyHours()}h/tuần</p>
      </div>
      <table class="routine-table">
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Sáng (2h)</th>
            <th>Trưa (2h)</th>
            <th>Tối (1-2h)</th>
          </tr>
        </thead>
        <tbody>
          ${PLAN_DATA.weeklyRoutine
            .map(
              (r) => `
              <tr>
                <td>${escapeHtml(r.day)}</td>
                <td>${escapeHtml(r.morning)}</td>
                <td>${escapeHtml(r.noon)}</td>
                <td>${escapeHtml(r.evening)}</td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>

      <div class="card-section-title">Quy tắc vàng</div>
      <div class="grid">
        <div class="card">
          <h3>🎯 Quy tắc 2/1</h3>
          <p style="font-size:0.92rem; color:var(--text-muted);">Cứ 2 tuần học course phải có ≥1 mini project trên GitHub. Không đạt = ĐỎ ALERT.</p>
        </div>
        <div class="card">
          <h3>🛌 Rest day = REST</h3>
          <p style="font-size:0.92rem; color:var(--text-muted);">Chủ nhật tuyệt đối không động laptop. Burnout là kẻ thù số 1 trong career switch.</p>
        </div>
        <div class="card">
          <h3>📦 Mỗi 2 tuần 1 deliverable</h3>
          <p style="font-size:0.92rem; color:var(--text-muted);">Push lên GitHub (commit, blog, lab, notebook). Không có deliverable = đỏ alert.</p>
        </div>
        <div class="card">
          <h3>📊 Monthly review</h3>
          <p style="font-size:0.92rem; color:var(--text-muted);">Cuối mỗi tháng, đánh giá tiến độ vs plan, điều chỉnh checkpoint nếu cần.</p>
        </div>
      </div>
    `;
  }
}

customElements.define("ml-view-routine", MlViewRoutine);
