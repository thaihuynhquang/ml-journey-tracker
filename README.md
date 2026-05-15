# ML Engineer Journey Tracker

[![Deploy to GitHub Pages](https://github.com/thaihuynhquang/ml-journey-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/thaihuynhquang/ml-journey-tracker/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Live demo**: [https://thaihuynhquang.github.io/ml-journey-tracker/](https://thaihuynhquang.github.io/ml-journey-tracker/)

Web app local + GitHub Pages để track tiến độ học ML/AI 10-12 tháng — chuyển từ Frontend Developer sang AI/ML Engineer + lấy Google Professional Machine Learning Engineer cert.

## Features

- 6 tabs: Dashboard, Phases, Job Hunt, Costs, Risks, Routine.
- 150+ checkable tasks, lưu vào `localStorage` (không sync server — privacy-safe).
- Auto-tính current week dựa trên `startDate`.
- Dark/light theme (auto-detect system preference).
- Export/Import progress dưới dạng JSON.
- Responsive (mobile/tablet/desktop).
- Pure HTML/CSS/JS — không cần build, không cần npm.

## Sử dụng

### Mở public site

[https://thaihuynhquang.github.io/ml-journey-tracker/](https://thaihuynhquang.github.io/ml-journey-tracker/)

### Chạy local

```bash
git clone https://github.com/thaihuynhquang/ml-journey-tracker.git
cd ml-journey-tracker
open index.html
```

Hoặc dùng local server:

```bash
python3 -m http.server 8080
# mở http://localhost:8080
```

### Persistence

Progress lưu vào `localStorage` của browser. Đóng browser mở lại vẫn còn. Clear browser data sẽ mất → **Export định kỳ** qua icon download ở header, lưu file JSON vào iCloud/Dropbox.

## Customize cho bạn

Lộ trình hiện tại được thiết kế cho profile: **Frontend Developer 9 năm (React, RN, TS) → ML Engineer**. Nếu background của bạn khác, fork repo và edit `data.js`:

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
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions deploy workflow
├── index.html              # Layout + nav + meta tags
├── styles.css              # Modern UI + dark/light theme
├── data.js                 # Plan data (separate from logic)
├── app.js                  # App logic + localStorage
├── 404.html                # 404 fallback redirect
├── LICENSE                 # MIT
└── README.md
```

## Deployment

Auto-deploy via GitHub Actions mỗi lần push `main`. Setup:

1. Settings → Pages → Source: **GitHub Actions** (đã set sẵn).
2. Push code → workflow `deploy.yml` chạy → site live sau 1-2 phút.

Workflow dùng official GitHub Pages actions:

- `actions/checkout@v4`
- `actions/configure-pages@v5`
- `actions/upload-pages-artifact@v3`
- `actions/deploy-pages@v4`

## Cập nhật

```bash
git add .
git commit -m "..."
git push
```

Site update sau ~1-2 phút.

## License

[MIT](./LICENSE) — fork & customize thoải mái.

## Disclaimer

Lộ trình này được personalized cho profile cụ thể (9 năm FE → ML, target Google Pro ML Engineer cert). Không phải one-size-fits-all. Hãy customize `data.js` theo background của bạn trước khi dùng.
