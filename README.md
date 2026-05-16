# ML Engineer Journey Tracker

[![Deploy to GitHub Pages](https://github.com/thaihuynhquang/ml-journey-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/thaihuynhquang/ml-journey-tracker/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Live demo**: [https://thaihuynhquang.github.io/ml-journey-tracker/](https://thaihuynhquang.github.io/ml-journey-tracker/)

Web app local + GitHub Pages để track tiến độ học ML/AI 10-12 tháng — chuyển từ Frontend Developer sang AI/ML Engineer + lấy Google Professional Machine Learning Engineer cert.

## Features

- 7 tabs: Dashboard, Phases, Job Hunt, Costs, Resources, Risks, Routine.
- 150+ checkable tasks, lưu vào `localStorage` (không sync server — privacy-safe).
- Auto-tính current week dựa trên `startDate`.
- Dark/light theme (auto-detect system preference).
- Export/Import progress dưới dạng JSON.
- Hash routes (`#/dashboard`, `#/phases`, …) tương thích GitHub Pages project site.
- TypeScript, ES modules, Vite build, light-DOM Web Components (`ml-view-*`).

## Sử dụng

### Mở public site

[https://thaihuynhquang.github.io/ml-journey-tracker/](https://thaihuynhquang.github.io/ml-journey-tracker/)

### Chạy local

```bash
git clone https://github.com/thaihuynhquang/ml-journey-tracker.git
cd ml-journey-tracker
npm install
npm run dev
```

Build production và preview:

```bash
npm run build
npm run preview
```

### GitHub Pages (repo settings)

1. **Settings → Pages → Build and deployment → Source**: chọn **GitHub Actions** (không publish từ branch folder khi dùng build Vite).
2. Push `main` → workflow chạy `npm ci` + `npm run build` → upload artifact thư mục **`dist/`** → deploy.

### Persistence

Progress lưu vào `localStorage` của browser. Đóng browser mở lại vẫn còn. Clear browser data sẽ mất → **Export định kỳ** qua icon download ở header, lưu file JSON vào iCloud/Dropbox.

## Customize cho bạn

Lộ trình hiện tại được thiết kế cho profile: **Frontend Developer 9 năm (React, RN, TS) → ML Engineer**. Nếu background của bạn khác, fork repo và edit [`src/data/planData.ts`](src/data/planData.ts):

- `meta.startDate` — ngày bắt đầu thực tế của bạn
- `phases[].weeks[].tasks[]` — danh sách task mỗi tuần
- `phases[].checkpoint.criteria[]` — tiêu chí PASS checkpoint
- `phases[].checkpoint.fallbacks[]` — fallback path nếu FAIL
- `costs.options[]` — các option chi phí
- `jobHunt.targetRoles[]` — target roles

**Quan trọng**: giữ nguyên `id` của task để không mất progress đã check.

## Cấu trúc

```
ml-journey-tracker/
├── .github/workflows/deploy.yml
├── index.html                 # Vite entry shell
├── public/404.html
├── public/.nojekyll
├── src/
│   ├── main.ts
│   ├── router.ts
│   ├── renderer.ts
│   ├── progress.ts
│   ├── data/planData.ts
│   ├── state/
│   ├── views/                 # Custom elements ml-view-*
│   └── styles/                # @layer + partials
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Deployment

Push `main` → GitHub Actions build và deploy `dist/`. Site cập nhật sau ~1–2 phút.

## Cập nhật

```bash
git add .
git commit -m "..."
git push
```

## License

[MIT](./LICENSE) — fork & customize thoải mái.

## Disclaimer

Lộ trình này được personalized cho profile cụ thể (9 năm FE → ML, target Google Pro ML Engineer cert). Không phải one-size-fits-all. Hãy customize `planData.ts` theo background của bạn trước khi dùng.
