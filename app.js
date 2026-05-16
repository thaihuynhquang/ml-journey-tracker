(function () {
  const STORAGE_KEY = "ml-journey-tracker-v1";
  const THEME_KEY = "ml-journey-theme";
  const TAB_KEY = "ml-journey-tab";
  const PHASE_KEY = "ml-journey-active-phase";

  const data = window.PLAN_DATA;

  const state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed };
    } catch {
      return defaultState();
    }
  }

  function defaultState() {
    return {
      checked: {},
      notes: {},
      costOption: "recommended",
      startDate: data.meta.startDate,
      dailyHours: data.meta.dailyHours,
      daysPerWeek: data.meta.daysPerWeek,
    };
  }

  const COST_OPTION_MIGRATION = {
    optimal: "recommended",
    budget: "minimal",
    medium: "full",
  };

  function normalizeState() {
    if (COST_OPTION_MIGRATION[state.costOption]) {
      state.costOption = COST_OPTION_MIGRATION[state.costOption];
    }
    if (!data.costs.options.some((o) => o.id === state.costOption)) {
      state.costOption = "recommended";
    }
    if (typeof state.dailyHours !== "number" || state.dailyHours < 1) {
      state.dailyHours = data.meta.dailyHours;
    }
    if (typeof state.daysPerWeek !== "number" || state.daysPerWeek < 1) {
      state.daysPerWeek = data.meta.daysPerWeek;
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function toggleTask(id) {
    state.checked[id] = !state.checked[id];
    saveState();
  }

  function isChecked(id) {
    return !!state.checked[id];
  }

  function getAllTaskIds() {
    const ids = [];
    data.phases.forEach((p) => {
      p.weeks.forEach((w) => {
        w.tasks.forEach((t) => ids.push(t.id));
      });
      if (p.checkpoint) {
        p.checkpoint.criteria.forEach((c) => ids.push(c.id));
      }
    });
    data.jobHunt.tasks.forEach((t) => ids.push(t.id));
    return ids;
  }

  function getCompletedCount(ids) {
    return ids.filter((id) => isChecked(id)).length;
  }

  function getPhaseProgress(phase) {
    const ids = [];
    phase.weeks.forEach((w) => w.tasks.forEach((t) => ids.push(t.id)));
    if (phase.checkpoint) phase.checkpoint.criteria.forEach((c) => ids.push(c.id));
    return { total: ids.length, done: getCompletedCount(ids) };
  }

  function getWeekProgress(week) {
    const total = week.tasks.length;
    const done = week.tasks.filter((t) => isChecked(t.id)).length;
    return { total, done };
  }

  function getCheckpointProgress(checkpoint) {
    const total = checkpoint.criteria.length;
    const done = checkpoint.criteria.filter((c) => isChecked(c.id)).length;
    const passNum = parseInt((checkpoint.passRule.match(/(\d+)\/(\d+)/) || [])[1] || total, 10);
    return { total, done, passed: done >= passNum };
  }

  function getCurrentWeek() {
    const start = new Date(state.startDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = today - start;
    const weekNum = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
    return Math.max(1, Math.min(weekNum, data.meta.totalWeeks));
  }

  function getWeeklyHours() {
    return state.dailyHours * state.daysPerWeek;
  }

  function getCalendarWeeksNeeded() {
    const weekly = getWeeklyHours();
    if (!weekly) return data.meta.totalWeeks;
    return Math.ceil(data.meta.totalHours / weekly);
  }

  function getProjectedEndDate() {
    const start = new Date(state.startDate + "T00:00:00");
    const end = new Date(start);
    end.setDate(end.getDate() + getCalendarWeeksNeeded() * 7);
    return end;
  }

  function formatDate(d) {
    return d.toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric" });
  }

  function resetScheduleDefaults() {
    state.startDate = data.meta.startDate;
    state.dailyHours = data.meta.dailyHours;
    state.daysPerWeek = data.meta.daysPerWeek;
    saveState();
    renderAll();
    showToast("Đã đặt lại lịch học mặc định");
  }

  function getCurrentPhase() {
    const week = getCurrentWeek();
    return data.phases.find((p) => {
      const [start, end] = p.weekRange.match(/(\d+)-(\d+)/).slice(1).map(Number);
      return week >= start && week <= end;
    }) || data.phases[0];
  }

  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function formatToday() {
    const opts = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date().toLocaleDateString("vi-VN", opts);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderDashboard() {
    const allIds = getAllTaskIds();
    const done = getCompletedCount(allIds);
    const total = allIds.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const currentWeek = getCurrentWeek();
    const currentPhase = getCurrentPhase();
    const passedCheckpoints = data.phases.filter((p) => p.checkpoint && getCheckpointProgress(p.checkpoint).passed).length;
    const weeklyHours = getWeeklyHours();
    const calendarWeeks = getCalendarWeeksNeeded();
    const projectedEnd = getProjectedEndDate();
    const restDays = 7 - state.daysPerWeek;

    const phaseCards = data.phases
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

    const timelineItems = data.successCriteria
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

    document.getElementById("view-dashboard").innerHTML = `
      <div class="hero">
        <h2>${escapeHtml(data.meta.title)}</h2>
        <p>${escapeHtml(data.meta.subtitle)}</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="label">Overall Progress</div>
            <div class="value">${pct}%</div>
            <div class="sub">${done}/${total} tasks</div>
          </div>
          <div class="hero-stat">
            <div class="label">Current Week</div>
            <div class="value">Tuần ${currentWeek}</div>
            <div class="sub">/${data.meta.totalWeeks} tuần</div>
          </div>
          <div class="hero-stat">
            <div class="label">Current Phase</div>
            <div class="value" style="font-size:1.1rem;line-height:1.4;">${escapeHtml(currentPhase.title.replace("Phase ", "P"))}</div>
            <div class="sub">${escapeHtml(currentPhase.subtitle)}</div>
          </div>
          <div class="hero-stat">
            <div class="label">Checkpoints</div>
            <div class="value">${passedCheckpoints}/${data.phases.length}</div>
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
          <span><strong>${calendarWeeks}</strong> tuần lịch (≈ ${data.meta.totalHours}h curriculum)</span>
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

    document.querySelectorAll(".phase-overview-card").forEach((el) => {
      el.addEventListener("click", () => {
        localStorage.setItem(PHASE_KEY, el.dataset.phaseId);
        switchTab("phases");
      });
    });

    const startDateEl = document.getElementById("start-date");
    const dailyHoursEl = document.getElementById("daily-hours");
    const daysPerWeekEl = document.getElementById("days-per-week");
    const scheduleResetEl = document.getElementById("schedule-reset-btn");

    if (startDateEl) {
      startDateEl.addEventListener("change", (e) => {
        if (!e.target.value) return;
        state.startDate = e.target.value;
        saveState();
        renderAll();
      });
    }

    if (dailyHoursEl) {
      dailyHoursEl.addEventListener("change", (e) => {
        const val = parseFloat(e.target.value);
        if (!val || val < 1) return;
        state.dailyHours = Math.min(12, val);
        saveState();
        renderAll();
      });
    }

    if (daysPerWeekEl) {
      daysPerWeekEl.addEventListener("change", (e) => {
        state.daysPerWeek = parseInt(e.target.value, 10);
        saveState();
        renderAll();
      });
    }

    if (scheduleResetEl) {
      scheduleResetEl.addEventListener("click", resetScheduleDefaults);
    }
  }

  function renderPhases() {
    const activePhaseId = localStorage.getItem(PHASE_KEY) || data.phases[0].id;
    const activePhase = data.phases.find((p) => p.id === activePhaseId) || data.phases[0];

    const phaseNav = data.phases
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
    const checkpointHtml = cp
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

    document.getElementById("view-phases").innerHTML = `
      <div class="phase-nav">${phaseNav}</div>
      <div class="phase-header">
        <h2>${escapeHtml(activePhase.title)}</h2>
        <p class="subtitle">${escapeHtml(activePhase.subtitle)} · ${escapeHtml(activePhase.weekRange)} · ${activePhase.hours}h</p>
      </div>
      ${weeksHtml}
      ${checkpointHtml}
    `;

    document.querySelectorAll(".phase-nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        localStorage.setItem(PHASE_KEY, btn.dataset.phaseId);
        renderPhases();
      });
    });

    document.querySelectorAll(".week-header").forEach((h) => {
      h.addEventListener("click", () => h.parentElement.classList.toggle("open"));
    });

    document.querySelectorAll("#view-phases .task-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        toggleTask(e.target.dataset.taskId);
        renderPhases();
        renderDashboard();
      });
    });

    if (activePhase.weeks.length > 0) {
      const firstWeek = document.querySelector(`#view-phases [data-week-id="${activePhase.weeks[0].id}"]`);
      if (firstWeek) firstWeek.classList.add("open");
    }
  }

  function renderJob() {
    const jh = data.jobHunt;
    const total = jh.tasks.length;
    const done = jh.tasks.filter((t) => isChecked(t.id)).length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    document.getElementById("view-job").innerHTML = `
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

    document.querySelectorAll("#view-job .task-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        toggleTask(e.target.dataset.taskId);
        renderJob();
        renderDashboard();
      });
    });
  }

  function renderCosts() {
    const sortedOptions = [...data.costs.options].sort((a, b) => {
      if (a.id === "recommended") return -1;
      if (b.id === "recommended") return 1;
      return 0;
    });

    const costsHtml = sortedOptions
      .map((opt) => {
        const selected = state.costOption === opt.id;
        const isRecommended = opt.id === "recommended";
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
        return `
          <div class="cost-option ${selected ? "selected" : ""} ${isRecommended ? "cost-option-recommended" : ""}" data-cost-id="${opt.id}">
            <h4>${escapeHtml(opt.title)}${isRecommended ? '<span class="cost-recommended-badge">Recommended</span>' : ""}</h4>
            <div class="cost-total">$${opt.total} <span class="currency">USD</span></div>
            ${opt.netNote ? `<p class="cost-net-note">${escapeHtml(opt.netNote)}</p>` : ""}
            <ul class="cost-items">${itemsHtml}</ul>
          </div>
        `;
      })
      .join("");

    document.getElementById("view-costs").innerHTML = `
      <div class="phase-header">
        <h2>Chi phí đầu tư</h2>
        <p class="subtitle">3 lựa chọn — mặc định Innovators Plus $299 (tiết kiệm nhất). Click để chọn.</p>
      </div>
      <div class="cost-options">${costsHtml}</div>

      <div class="card-section-title">Cảnh báo</div>
      <div class="card">
        <ul style="padding-left:20px; margin:0;">
          ${data.costs.warnings.map((w) => `<li style="margin-bottom:8px; font-size:0.92rem;">${escapeHtml(w)}</li>`).join("")}
        </ul>
      </div>
    `;

    document.querySelectorAll(".cost-option").forEach((el) => {
      el.addEventListener("click", () => {
        state.costOption = el.dataset.costId;
        saveState();
        renderCosts();
        showToast("Đã chọn option: " + data.costs.options.find((o) => o.id === state.costOption).title);
      });
    });
  }

  function renderRisks() {
    document.getElementById("view-risks").innerHTML = `
      <div class="phase-header">
        <h2>Rủi ro & Fallback chiến lược</h2>
        <p class="subtitle">${data.risks.length} rủi ro lớn nhất và cách xử lý</p>
      </div>
      ${data.risks
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

  function renderRoutine() {
    document.getElementById("view-routine").innerHTML = `
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
          ${data.weeklyRoutine
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

  function switchTab(tabId) {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tabId));
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + tabId));
    localStorage.setItem(TAB_KEY, tabId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function exportProgress() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ml-journey-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Đã export progress");
  }

  function importProgress(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
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

  function resetProgress() {
    if (!confirm("Bạn chắc muốn reset toàn bộ progress? Hành động này không thể undo.")) return;
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(state, defaultState());
    renderAll();
    showToast("Đã reset progress");
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(current === "light" ? "dark" : "light");
  }

  function renderAll() {
    renderDashboard();
    renderPhases();
    renderJob();
    renderCosts();
    renderRisks();
    renderRoutine();
  }

  function init() {
    normalizeState();
    const savedTheme = localStorage.getItem(THEME_KEY) || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(savedTheme);

    document.getElementById("today-badge").textContent = formatToday();
    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
    document.getElementById("export-btn").addEventListener("click", exportProgress);
    document.getElementById("import-input").addEventListener("change", (e) => {
      if (e.target.files[0]) importProgress(e.target.files[0]);
    });
    document.getElementById("reset-btn").addEventListener("click", resetProgress);

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });

    const savedTab = localStorage.getItem(TAB_KEY) || "dashboard";
    switchTab(savedTab);

    renderAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
