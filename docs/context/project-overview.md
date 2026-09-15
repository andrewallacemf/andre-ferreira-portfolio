# Project overview

**Product:** the personal portfolio site of André Ferreira, Senior Product Designer.
**Job of the page:** get André national and international product-design roles by showing selected work with evidence, in English (default) and Portuguese.
**Audience:** recruiters and design leaders skimming on desktop; the same people opening a link on a phone.

## Hard requirements (v1)
- Static site on GitHub Pages; custom domain later.
- Dark mode by default; light mode available; both complete.
- Two designed structures, desktop and touch, same logic. Hover never carries information touch would miss.
- WCAG AA; Lighthouse ≥ 90 on every category, mobile included; cookieless analytics.
- Content as data (`shared/content/*.json`); tokens as CSS custom properties (`shared/tokens.css`).
- Home shows 3 featured cases; `/work` lists all (8 in v1) and grows without touching the home.
- Language rule: André's contact with code is indirect, through AI. Copy says "human + AI collaboration", never implies he programs.

## Phases
0 Discovery · 1 Reference analysis · 2 Content (8 cases validated) · 3 Visual direction in code + 3.5 stack comparison (done 2026-09-15) · **4 Build v1 (current)** · 5 Complete & publish · 6 Evolution (domain, analytics, EN/PT polish, "how I built this site").

## Stack decision
**Astro**, decided 2026-09-15 after building the same home in Astro and in React + Vite. The site lives in `site/`; the React prototype stays in `archive/` as part of the process.
