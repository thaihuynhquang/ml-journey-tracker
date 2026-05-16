import { PLAN_DATA } from "../data/planData";
import { escapeHtml } from "../utils/html";

export class MlViewCosts extends HTMLElement {
  refresh(): void {
    const opt = PLAN_DATA.costs.options[0];
    const itemsHtml = opt.items
      .map(
        (it) => `
            <li>
              <div class="cost-name">
                ${escapeHtml(it.label)}
                ${it.note ? `<div class="cost-note">${escapeHtml(it.note)}</div>` : ""}
              </div>
              <div class="cost-price ${it.price === 0 ? "free" : ""}">${it.price === 0 ? "FREE" : "$" + it.price}</div>
            </li>
          `
      )
      .join("");

    this.innerHTML = `
      <div class="phase-header">
        <h2>Chi phí đầu tư</h2>
        <p class="subtitle">Tổng đầu tư $334 — net effective -$365 đến +$134 sau pass cert (zero hidden cost)</p>
      </div>
      <div class="cost-options">
        <div class="cost-option cost-option-recommended cost-option-static">
          <h4>${escapeHtml(opt.title)}<span class="cost-recommended-badge">Your plan</span></h4>
          <div class="cost-total">$${opt.total} <span class="currency">USD</span></div>
          ${opt.netNote ? `<p class="cost-net-note">${escapeHtml(opt.netNote)}</p>` : ""}
          <ul class="cost-items">${itemsHtml}</ul>
        </div>
      </div>

      <div class="card-section-title">Cảnh báo (tránh chi phí ẩn)</div>
      <div class="card">
        <ul style="padding-left:20px; margin:0;">
          ${PLAN_DATA.costs.warnings.map((w) => `<li style="margin-bottom:8px; font-size:0.92rem;">${escapeHtml(w)}</li>`).join("")}
        </ul>
      </div>
    `;
  }
}

customElements.define("ml-view-costs", MlViewCosts);
