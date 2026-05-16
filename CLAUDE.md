# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running Locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Production bundle preview:

```bash
npm run build
npm run preview
```

Do not rely on opening `index.html` via `file://`; use Vite dev server or serve the `dist/` folder over HTTP.

## Deployment

Push to `main` → GitHub Actions runs `npm ci` + `npm run build` and deploys the **`dist/`** artifact to GitHub Pages in ~1–2 minutes. In repo **Settings → Pages**, **Source** must be **GitHub Actions**. `vite.config.ts` uses `base: './'` for project-site URLs.

## Architecture

- **[`package.json`](package.json)** — `dev`, `build`, `preview`, `typecheck` scripts.
- **[`src/data/planData.ts`](src/data/planData.ts)** — `PLAN_DATA` (phases, weeks, tasks, costs, risks, routine). Pure data, no logic.
- **[`src/main.ts`](src/main.ts)** — Bootstrap: theme, header actions, tab/hash routing, `setRenderAll`, initial `renderAll()`.
- **[`src/state/storage.ts`](src/state/storage.ts)** — Mutable `state`, `localStorage` under `ml-journey-tracker-v1`.
- **[`src/views/*.ts`](src/views/)** — Light-DOM **Custom Elements** (`ml-view-*`), each with `refresh()` rebuilding `innerHTML` and wiring listeners.
- **[`src/styles/main.css`](src/styles/main.css)** — `@layer` + `@import` partials (`_tokens.css`, `_header.css`, …).

## State & Persistence

- Progress: `localStorage` key `ml-journey-tracker-v1` — `{ checked, notes, resourceUserFlags, startDate, dailyHours, daysPerWeek }`.
- Theme: `ml-journey-theme`. Active tab: `ml-journey-tab`. Active phase: `ml-journey-active-phase`.
- URL: hash routes `#/dashboard`, `#/phases`, etc., synced with the tab bar.

## Critical Constraint: Task IDs

Task `id` fields in `planData.ts` are primary keys for stored progress. **Changing or removing a task `id` will silently lose that user's checked state.** When adding tasks, always append new IDs; never reuse or rename existing ones.

## Adding a New Tab

1. Add `RouteId` and `ROUTE_IDS` in [`src/constants.ts`](src/constants.ts).
2. Add a tab button in [`index.html`](index.html) with `data-tab="<name>"`.
3. Add `<ml-view-<name> id="view-<name>" class="view">` in [`index.html`](index.html).
4. Create [`src/views/ml-view-<name>.ts`](src/views/) with `customElements.define` and `refresh()`.
5. Register the view in [`src/main.ts`](src/main.ts) import list and `setRenderAll` callback.
