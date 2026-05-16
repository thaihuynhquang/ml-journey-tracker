import { PLAN_DATA } from "../data/planData";
import { escapeHtml } from "../utils/html";

export class MlViewRisks extends HTMLElement {
  refresh(): void {
    this.innerHTML = `
      <div class="phase-header">
        <h2>Rủi ro & Fallback chiến lược</h2>
        <p class="subtitle">${PLAN_DATA.risks.length} rủi ro lớn nhất và cách xử lý</p>
      </div>
      ${PLAN_DATA.risks
        .map(
          (r, i) => `
          <div class="risk-card">
            <h3>${i + 1}. ${escapeHtml(r.title)}</h3>
            <div class="risk-signs">
              <strong>Dấu hiệu</strong>
              ${escapeHtml(r.signs)}
            </div>
            <div class="risk-action">
              <strong>Hành động</strong>
              ${escapeHtml(r.action)}
            </div>
          </div>
        `
        )
        .join("")}
    `;
  }
}

customElements.define("ml-view-risks", MlViewRisks);
