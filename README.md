# André Ferreira — Portfolio

Personal portfolio of André Ferreira, Senior Product Designer (design systems, B2B products, AI-assisted products). Built as a static site, published on GitHub Pages, designed and built as a human + AI collaboration.

## Status

**Phase 4 — build v1.** Stack decided on 2026-09-15: **Astro**, after the same home page was built twice (Astro vs React + Vite) from one shared source of tokens and content. The site lives in `site/`; the React prototype stays in `archive/` as part of the process. See `docs/context/decisions.md`.

## Structure

```
shared/            Single source of truth
  tokens.css       Design tokens: color (dark default + light), type, space, motion
  content/en.json  All copy in English (default language)
  content/pt.json  All copy in Portuguese (/pt/)
  SPEC.md          What the site implements, section by section
site/              The site (Astro 5, no UI framework)
archive/
  prototype-react-vite/  Prototype B from the stack comparison (not built, not deployed)
docs/              Project context (overview, architecture, decisions)
.github/workflows/ GitHub Pages deployment on every push to main
```

## Principles of this codebase

- Content is data: every string lives in `shared/content/*.json`; components never hard-code copy.
- Tokens before styles: components read CSS custom properties only; both themes are complete sets.
- Desktop and touch are two designed structures with the same logic; hover never carries information that touch would miss.
- Accessibility (WCAG AA), Lighthouse ≥ 90 and cookieless analytics are hard requirements of v1.

## Running the site locally

```
cd site
npm install
npm run dev               # http://localhost:4321
npm run build             # static output in site/dist/
```

## Author

André Ferreira · andrewallacemf@gmail.com · linkedin.com/in/andrewallacemf
