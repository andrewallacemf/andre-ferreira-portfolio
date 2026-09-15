# Prototype B — React 19 + Vite

Home (`/`, `/pt/`) and Work (`/work/`, `/pt/work/`) pages of André Ferreira's portfolio, built from the shared spec (`shared/SPEC.md`), the shared tokens (`shared/tokens.css`) and the shared copy (`shared/content/{en,pt}.json`). Nothing is copied: the JSON and the tokens are imported by relative path.

## Stack

| | |
|---|---|
| UI | React 19.3.0 (`react`, `react-dom`) |
| Build | Vite 8.3.0 + `@vitejs/plugin-react` 6.1.1 |
| Styling | one `src/styles.css` that `@import`s `shared/tokens.css`; plain BEM-ish classes, tokens only (no hex in components) |
| Routing | none at runtime. Four HTML entry points (`index.html`, `work/`, `pt/`, `pt/work/`) mount the same `<App>` with `data-lang` / `data-page` on `#root` |
| Pre-render | `scripts/prerender.mjs` renders every page with `react-dom/server` at build time and injects the markup into the built HTML; the client `hydrateRoot`s. Content is visible with JS disabled. |

## Run

```
npm install
npm run dev       # http://localhost:5173/  (also /work/, /pt/, /pt/work/)
npm run build     # vite build → vite build --ssr → prerender → preview/ → verify
npm run preview   # serves dist/ locally
npm run verify    # re-runs the relocatability check on dist/
```

`npm run build` writes `dist/` (relocatable: every asset and internal link is relative, checked from a nested folder) and `preview/` (identical to `dist/`, except `index.html` is the fragment described in SPEC.md "Build output requirements").

## Where to change what

| I need to… | Go to |
|---|---|
| Copy, cases, labels | `shared/content/en.json` and `pt.json` (both) |
| Colors, type, spacing, motion | `shared/tokens.css` |
| A section's structure | `src/components/<Section>.jsx` |
| A section's look | the matching block in `src/styles.css` |
| Page title / description | come from `meta.*` in the JSON via the tiny Vite plugin in `vite.config.js` |
| Strings the spec needs but the JSON lacks (Menu, Role, Scope) | `src/content-gaps.json` — move them into the shared JSON and delete the file |

## Implemented

- Header (fixed): name, centered nav, language switch preserving the current page, theme toggle (`aria-pressed`, `localStorage("theme")`, dark by default, applied by an inline script before first paint), mobile "Menu" button (`aria-expanded`) revealing the three links.
- Hero: three display lines, sub, "live" line with 6px dot, status pill, location / ©year in the bottom corners, "Scroll" hint (desktop only).
- Three featured case slides: status pill + year, title, italic result, Role/Scope definition list, three big-number tiles, "View case" CTA → `work/#slug`; right column placeholder panel (hairline, dotted grid, corner marks, big numbers). Desktop: only the CTA is a link. Touch (`hover: none`): an overlay link makes the whole slide tappable with a ↗ arrow.
- Principles: 7 quotes, hairline left border, alternating offsets on desktop.
- About + path (`#about`): three paragraphs, four eras, clients as hairline chips; scrolls internally on short screens.
- Contact (`#contact`, inverse ground): title, two bubbles + three `mailto:` chips revealed with a 400ms stagger the first time the section is ≥50% visible (visible at rest without JS / reduced motion), Email with Copy → "Copied" (1.5s), LinkedIn, Résumé (`#`), Medium; footer line + source link.
- `/work`: title + intro, 3/2/1-column grid of all 8 cases, each card `id=<slug>`, links to `#<slug>`, result clamped to 4 lines and expanded on tap/click (also via `:target` without JS), hover raises the card 4px on pointer devices.
- Scroll snap on desktop only: `<main>` is the scroll container (`100dvh`, `scroll-snap-type: y mandatory`); each slide is `100dvh` with `overflow-y: auto`, padded by the header height; below 1024px sections stack in normal flow.
- Dotted grid: fixed `<canvas>` (28px spacing), dots within 140px of the pointer scale to 2.2x and blend toward `--grid-dot-hot`; colors read from computed CSS variables and re-read on theme change; `requestAnimationFrame`; static on touch / reduced motion; `aria-hidden`.
- Custom cursor (hover + fine pointer + ≥1024px): 12px circle with lerp, grows to 64px (`mix-blend-mode: difference`) over `a`, `button`, `[data-cursor]`, shows labels from `cursor.*` in the JSON via `data-cursor`; `aria-hidden`; native cursor hidden only while it is active.
- Slide contents fade/translate in 12px over 320ms on entering; the hiding class is only ever added by JS, so resting state is visible.
- Accessibility: skip link, landmarks, visible `:focus-visible`, `aria-pressed`, `aria-expanded`, `aria-hidden` on canvas and cursor, `lang` + `hreflang` alternates.

## Known gaps

- Not visually QA'd in a real browser: the build environment had no browser (network limited to npm). Hydration was verified in jsdom for all four pages (identical markup, no React warnings). Layout was reviewed by reading, not by rendering — expect a round of visual polish.
- "Menu", "Role" and "Scope" are not in the shared JSON; they live in `src/content-gaps.json` until they are added there.
- Résumé link is the `#` placeholder from the spec; "Source on GitHub" points to `https://github.com/` as specified.
- `hreflang` alternates are relative URLs (the final origin is not known); Google prefers absolute ones. Marked `vite-ignore` so Vite does not treat them as assets.
- The React runtime dominates the JS budget (~73 kB gzipped for `react-dom` + app) — see NOTES.md.
