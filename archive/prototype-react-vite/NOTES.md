# NOTES — Prototype B (React 19 + Vite)

Measured on 2026-09-15, Node 22.22.2, Linux x64, clean `node_modules`.

## Versions

- react 19.3.0, react-dom 19.3.0
- vite 8.3.0 (Rolldown-based), @vitejs/plugin-react 6.1.1
- 4 direct dependencies (2 runtime + 2 dev); `npm install` → **21 packages** installed (16 unscoped + 5 scoped, incl. 2 platform bindings), `node_modules` 70 MB, install 1.2 s from cache.

## Build

- `npm run build` (vite client build → vite SSR build → prerender → preview/ → verify): **≈ 1.1 s** wall clock (Vite client 0.21 s, SSR 0.03 s, the rest is Node startup for the three scripts).
- `du -sh dist` → **360K** (`preview/` 360K as well).
- Output: `dist/index.html`, `dist/work/index.html`, `dist/pt/index.html`, `dist/pt/work/index.html`, `dist/assets/{main,en,pt}-*.js`, `dist/assets/style-*.css`.

## JS shipped on the English home (gzip -c | wc -c)

| chunk | raw | gzip |
|---|---|---|
| `assets/main-*.js` (react + react-dom/client + all components) | 239.9 kB | **73.2 kB** |
| `assets/en-*.js` (English JSON, loaded by dynamic import) | 8.2 kB | 3.5 kB |
| **total JS on `/`** | 248 kB | **76.8 kB** |
| `assets/style-*.css` (tokens + components) | 18 kB | 4.4 kB |

The Portuguese chunk is not downloaded on English pages. ~70 kB of the 73 kB is the React runtime; the app code itself is roughly 5 kB gzipped. This is above the 60 kB figure the spec sets for Astro and is the honest cost of "React on a mostly static page".

## Pre-rendering

Worked. `vite build --ssr src/entry-server.jsx` produces `.vite/ssr/entry-server.js`; `scripts/prerender.mjs` calls `renderToString(<App/>)` for each of the four pages and injects the markup into `#root` of the built HTML. The client (`src/main.jsx`) calls `hydrateRoot` when `#root` has children (and `createRoot` in dev). Verified in jsdom for all four pages: the DOM after hydration is byte-identical to the pre-rendered markup and React logs no hydration warning. With JS disabled every section, every link, both bubbles and all chips are visible; only the dot grid animation, the custom cursor, the theme toggle, the mobile menu and Copy need JS.

## Acceptance tests (SPEC.md)

1. **Nothing fixed cut at 375px** — fixed elements are the full-width 4rem header (name + PT/theme/Menu row ≈ 300px including gutters, all `white-space: nowrap` and fitting), the canvas (`inset: 0`), the cursor (never enabled on touch) and the skip link (off-screen until focused, then inside the viewport). The hero status pill is the one long label and is allowed to wrap. Pass by construction; not confirmed in a real browser (see caveat below).
2. **Every case card complete at rest** — the three home slides show pill, year, title, result, role, scope, three facts and the CTA with no hover; `/work` cards clamp the result to 4 lines as the spec asks, and expand on tap/click (`aria-expanded`) or via `:target` with no JS; hover only lifts the card 4px. Pass.
3. **No variable-width headline colliding with buttons on mobile** — the only element beside buttons is the fixed-content name (`nowrap`); the h1 lives in the flow under the header, never in the same row as a control. Pass.

## Spec items and how they were handled

- "Menu", "Role" and "Scope" are required by SPEC.md but absent from `shared/content/*.json`. Rather than hard-code them inside components they live in `src/content-gaps.json` (en/pt), merged into the content context as `ui.*`. Proposal: add `nav.menu`, `cases.roleLabel`, `cases.scopeLabel` to both shared JSON files and delete that file.
- `hreflang` alternates are relative (`./pt/`, `../`, …) because the final origin is unknown; they carry `vite-ignore` so Vite's HTML pipeline does not resolve them as assets.
- The reactive dots follow the pointer over the whole page, not only in the hero (the canvas is one fixed layer; limiting it to the hero would be a one-line check on the hero's bounding box).
- Theme toggle renders "Dark" on the server and corrects itself after hydration if the stored choice is light (the `<html data-theme>` itself is right from the first paint thanks to the inline script; only the button label can flash).
- Not visually QA'd: the build sandbox had no browser (network limited to the npm registry; Playwright's Chromium download is blocked). Structure, links, hydration and relocatability were tested with Node + jsdom; layout and motion were reviewed by reading the CSS. Budget a visual pass before comparing pixels with Prototype A.

## DX assessment (designer editing JSON copy and CSS tokens, using AI for code)

1. Copy and tokens are genuinely decoupled: change a string in `shared/content/*.json` or a value in `shared/tokens.css`, rebuild, done; no component references a literal string or a hex color, and `vite dev` hot-reloads both.
2. The code is small and flat — 12 components under 150 lines, one 300-line stylesheet grouped by section, no router, no state library — which is the shape AI edits reliably; "change the About layout" maps to one `.jsx` file and one CSS block.
3. React + hand-rolled pre-rendering adds rules a designer will not know: DOM/`window` only inside `useEffect`, server and client markup must match, device-dependent variations must be CSS (`@media`) not JSX. Break one and you get a hydration warning, not a visible error — the AI has to be told these rules.
4. The build is five steps stitched in `package.json` (client build, SSR build, prerender, preview fragment, verify); each script is ~40 readable lines, but it is custom plumbing the framework does not own, so a Vite major bump or a new page means touching `scripts/` and `vite.config.js`, not just adding a file.
5. Runtime cost is the weak point: ~73 kB gzipped of React to power a cursor, a canvas and two buttons on a page that is otherwise static; the same interactions are 3–5 kB of plain JS, which is exactly what the Astro islands version ships.
