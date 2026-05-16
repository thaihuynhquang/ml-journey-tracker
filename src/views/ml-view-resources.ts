import { getResourceFlags, toggleResourceFlag } from "../actions/resourceFlags";
import { PLAN_DATA } from "../data/planData";
import { resourceFilter } from "../state/resourceFilter";
import { escapeHtml } from "../utils/html";

export class MlViewResources extends HTMLElement {
  refresh(): void {
    const filter = resourceFilter;
    if (filter.user === undefined) filter.user = "all";

    const phaseLabels: Record<string, string> = {
      phase1: "P1",
      phase2: "P2",
      phase3: "P3",
      phase4: "P4",
      phase5: "P5",
    };

    const statusLabels: Record<string, string> = {
      free: "FREE",
      paid: "PAID",
      owned: "OWNED",
    };

    function matchesUserFilter(r: (typeof PLAN_DATA.resources.items)[number]): boolean {
      const flags = getResourceFlags(r.id);
      if (filter.user === "chua-mua") return r.status === "paid" && !flags.purchased;
      if (filter.user === "verified") return flags.verified;
      if (filter.user === "can-thay") return flags.needsSubstitute;
      return true;
    }

    const filtered = PLAN_DATA.resources.items.filter((r) => {
      if (filter.phase !== "all" && !(r.phases as readonly string[]).includes(filter.phase)) return false;
      if (filter.status !== "all" && r.status !== filter.status) return false;
      if (!matchesUserFilter(r)) return false;
      return true;
    });

    const paidTotal = PLAN_DATA.resources.items
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + r.cost, 0);

    const unpaidPaidCount = PLAN_DATA.resources.items.filter(
      (r) => r.status === "paid" && !getResourceFlags(r.id).purchased
    ).length;

    const phaseChips = [
      { id: "all", label: "All" },
      { id: "phase1", label: "Phase 1" },
      { id: "phase2", label: "Phase 2" },
      { id: "phase3", label: "Phase 3" },
      { id: "phase4", label: "Phase 4" },
      { id: "phase5", label: "Phase 5" },
    ];

    const statusChips = [
      { id: "all", label: "All" },
      { id: "free", label: "FREE" },
      { id: "paid", label: "PAID" },
      { id: "owned", label: "OWNED" },
    ];

    const userChips = [
      { id: "all", label: "All" },
      { id: "chua-mua", label: "Not purchased yet" },
      { id: "verified", label: "Verified" },
      { id: "can-thay", label: "Needs substitute" },
    ];

    const filtersHtml = `
      <div class="resource-filters">
        <div class="resource-filter-group">
          <span class="resource-filter-label">Phase</span>
          ${phaseChips
            .map(
              (c) =>
                `<button type="button" class="filter-chip ${filter.phase === c.id ? "active" : ""}" data-filter-type="phase" data-filter-value="${c.id}">${escapeHtml(c.label)}</button>`
            )
            .join("")}
        </div>
        <div class="resource-filter-group">
          <span class="resource-filter-label">Catalog</span>
          ${statusChips
            .map(
              (c) =>
                `<button type="button" class="filter-chip ${filter.status === c.id ? "active" : ""}" data-filter-type="status" data-filter-value="${c.id}">${escapeHtml(c.label)}</button>`
            )
            .join("")}
        </div>
        <div class="resource-filter-group">
          <span class="resource-filter-label">My status</span>
          ${userChips
            .map(
              (c) =>
                `<button type="button" class="filter-chip ${filter.user === c.id ? "active" : ""}" data-filter-type="user" data-filter-value="${c.id}">${escapeHtml(c.label)}</button>`
            )
            .join("")}
        </div>
      </div>
    `;

    const categoriesHtml = PLAN_DATA.resources.categories
      .map((cat) => {
        const items = filtered.filter((r) => r.category === cat.id);
        if (!items.length) return "";
        const cardsHtml = items
          .map((r) => {
            const flags = getResourceFlags(r.id);
            const phaseTags = r.phases
              .map((p) => `<span class="resource-phase-tag">${phaseLabels[p] || p}</span>`)
              .join("");
            let priceBadge: string;
            if (r.status === "paid") {
              priceBadge = flags.purchased
                ? `<span class="resource-badge owned">Owned</span>`
                : `<span class="resource-badge paid">$${r.cost}</span>`;
            } else {
              priceBadge = `<span class="resource-badge ${r.status}">${statusLabels[r.status]}</span>`;
            }
            const userChipsHtml = [
              flags.verified ? `<span class="resource-user-chip verified">Verified</span>` : "",
              flags.needsSubstitute
                ? `<span class="resource-user-chip blocked">Needs substitute</span>`
                : "",
            ]
              .filter(Boolean)
              .join("");
            const purchaseBtn =
              r.status === "paid"
                ? `<button type="button" class="resource-action-btn ${flags.purchased ? "active" : ""}" data-resource-id="${escapeHtml(r.id)}" data-flag="purchased">${flags.purchased ? "Purchased" : "Mark purchased"}</button>`
                : "";
            const cardClass = flags.needsSubstitute ? "resource-card resource-card-blocked" : "resource-card";
            return `
              <div class="${cardClass}" data-resource-id="${escapeHtml(r.id)}">
                <div class="resource-card-header">
                  <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.title)}</a>
                  ${priceBadge}
                </div>
                <div class="resource-card-meta">${phaseTags}${userChipsHtml}</div>
                ${r.note ? `<p class="resource-note">${escapeHtml(r.note)}</p>` : ""}
                <div class="resource-actions">
                  ${purchaseBtn}
                  <button type="button" class="resource-action-btn ${flags.verified ? "active" : ""}" data-resource-id="${escapeHtml(r.id)}" data-flag="verified">Verified</button>
                  <button type="button" class="resource-action-btn ${flags.needsSubstitute ? "active" : ""}" data-resource-id="${escapeHtml(r.id)}" data-flag="needsSubstitute">Needs substitute</button>
                </div>
              </div>
            `;
          })
          .join("");
        return `
          <div class="resource-category">
            <h3 class="resource-category-title">${escapeHtml(cat.title)} <span class="resource-count">(${items.length})</span></h3>
            <div class="resource-grid">${cardsHtml}</div>
          </div>
        `;
      })
      .join("");

    this.innerHTML = `
      <div class="phase-header">
        <h2>Resources</h2>
        <p class="subtitle">${filtered.length}/${PLAN_DATA.resources.items.length} resources · Catalog paid total: ${paidTotal} · Not purchased yet: ${unpaidPaidCount}</p>
      </div>

      ${filtersHtml}

      <div class="resource-summary card">
        <div class="resource-summary-stats">
          <span><strong>${PLAN_DATA.resources.items.filter((r) => r.status === "free").length}</strong> FREE</span>
          <span><strong>${PLAN_DATA.resources.items.filter((r) => r.status === "owned").length}</strong> OWNED</span>
          <span><strong>${PLAN_DATA.resources.items.filter((r) => r.status === "paid").length}</strong> PAID</span>
          <span><strong>${PLAN_DATA.resources.items.filter((r) => getResourceFlags(r.id).verified).length}</strong> Verified</span>
          <span><strong>${PLAN_DATA.resources.items.filter((r) => getResourceFlags(r.id).needsSubstitute).length}</strong> Needs substitute</span>
        </div>
      </div>

      ${categoriesHtml || '<p class="muted" style="padding:24px 0;">No resources match the current filters.</p>'}
    `;

    this.querySelectorAll(".filter-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const el = btn as HTMLElement;
        const type = el.dataset.filterType;
        const value = el.dataset.filterValue;
        if (type === "phase" && value) filter.phase = value;
        if (type === "status" && value) filter.status = value;
        if (type === "user" && value) filter.user = value;
        this.refresh();
      });
    });

    this.querySelectorAll(".resource-action-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const el = btn as HTMLElement;
        const id = el.dataset.resourceId;
        const flag = el.dataset.flag as "purchased" | "verified" | "needsSubstitute" | undefined;
        if (id && flag) toggleResourceFlag(id, flag);
        this.refresh();
      });
    });
  }
}

customElements.define("ml-view-resources", MlViewResources);
