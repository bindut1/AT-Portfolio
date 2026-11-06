# Nguyễn Lê Anh Thư — Portfolio (v2)

Static portfolio website rebuilt from the Canva design
"Red and Black Modern Creative Portfolio Presentation" (10 pages: cover, xin chào,
về mình, học vấn & kỹ năng, kinh nghiệm làm việc, dự án tiêu biểu, dự án 1,
dự án 2, liên hệ, thank you).

## Stack

- Plain HTML + CSS + a small vanilla JS file, no build step
- Google Fonts: Barlow Condensed (headings), Be Vietnam Pro (body), Anton
  (cover titles, stands in for Impact), Inter (labels, stands in for Helvetica Now),
  Figtree (experience list, stands in for Proxima Nova)

## Run locally

```bash
python3 -m http.server 5173
# open http://127.0.0.1:5173
```

## How the layout works

Each section is a 1366 × 768 artboard, matching the Canva page size. Elements are
positioned with design-pixel values (`--x`, `--y`, `--w`, `--h`) that are converted
to `cqw` units, so on desktop the page scales exactly like the original design.

Each orange circle + cut-out photo + paper plane is grouped in a `.fig` box. Below
900px the sections switch to a stacked layout and every `.fig` becomes a block at the
top of its section that keeps the design composition (its children are re-scaled
against the box width via `--fw`).

```
index.html             markup, one <section> per Canva page
css/styles.css         artboard system, typography, components, mobile layout
css/motion.css         navigation, intro + scroll animations, back-to-top
js/main.js             letter split, scroll reveal, parallax, active nav, mobile menu
assets/images/         photos/textures exported from the Canva design (WebP)
assets/images/tools/   tool logos (Canva, CapCut, ChatGPT, TikTok)
```

## Motion & navigation

- Floating pill navigation (desktop) / full-screen menu (≤1100px), auto-hides on
  scroll down, highlights the current section
- Cover: big title letters rise in, portrait slides up, slow background zoom
- Scroll reveal: circles pop, photos rise, paper planes fly in, headings unmask,
  pills/tool logos pop; the sun doodle slowly spins
- Respects `prefers-reduced-motion`; content stays visible without JavaScript

When changing CSS/JS, bump the `?v=` query in `index.html` so visitors get the
new files instead of a cached copy.

## Deploy

Any static host works (GitHub Pages, Netlify, Vercel). For GitHub Pages, deploy
from `main` (repository root).
