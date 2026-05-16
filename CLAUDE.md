# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running Locally

No build step. Open directly:

```bash
open index.html
# or with a local server:
python3 -m http.server 8080
```

No npm, no dependencies, no lint, no tests.

## Deployment

Push to `main` → GitHub Actions auto-deploys to GitHub Pages in ~1-2 minutes. No manual steps.

## Architecture

Three files, loaded in order by `index.html`:

1. **`data.js`** — sets `window.PLAN_DATA` (a plain JS object). Pure data: phases, weeks, tasks, costs, risks, routine. No logic.
2. **`app.js`** — single IIFE that reads `window.PLAN_DATA` and owns all logic: state (localStorage), rendering, event wiring.
3. **`styles.css`** — CSS custom properties for theming; `[data-theme="dark"]` on `<html>` switches theme.

`index.html` is a static shell: header, 6 `<section id="view-*">` placeholders that `app.js` fills via `innerHTML`.

## State & Persistence

- All progress lives in `localStorage` under key `ml-journey-tracker-v1` as `{ checked: {}, notes: {}, costOption: string, startDate: string }`.
- Theme: `ml-journey-theme`. Active tab: `ml-journey-tab`. Active phase: `ml-journey-active-phase`.
- Every `render*()` call rebuilds the entire section's `innerHTML` from scratch — there is no virtual DOM or diffing.

## Critical Constraint: Task IDs

Task `id` fields in `data.js` are the primary keys for stored progress. **Changing or removing a task's `id` will silently lose that user's checked state.** When adding tasks, always append new IDs; never reuse or rename existing ones.

## Adding a New Tab

1. Add a `<button class="tab" data-tab="<name>">` in `index.html`.
2. Add `<section id="view-<name>" class="view"></section>` in `index.html`.
3. Add a `render<Name>()` function in `app.js`.
4. Call it inside `renderAll()`.
