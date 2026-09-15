# NOTES — Prototype A (Astro)

Measured on 2026-09-15, Node 22.22.2, npm 10.9.7, Linux, warm npm cache.

## Versions

- astro 5.18.2 (pinned exact); vite 6.4.3 (transitive, pinned via package-lock.json)
- No UI framework, no other runtime dependency.

## Numbers

| Metric | Value |
| --- | --- |
| `npm install` | 1 direct dependency (`astro`); 282 packages in `node_modules` (npm: "audited 283 packages", the extra one is the project itself); install ≈ 1 s with a warm npm cache (cold install not timed) |
| Build time (`npm run build`, clean `dist/`, astro build + postbuild + preview) | 2.5 s wall clock; Astro's own "4 page(s) built in 1.49s" |
| `du -sh dist` | 144K (114,681 bytes: 4 HTML pages + 3 CSS files, no JS files) |
| `du -sh preview` | 144K (identical to dist except `index.html` is the fragment) |
| JS shipped on the English home | 7 `<script>` tags, all inlined by Astro (1 inline theme script + 6 `type="module"`): 5,789 B raw, **3,160 B gzipped** as the sum of each script gzipped separately (2,317 B if concatenated). Budget in SPEC.md: 60 kB → 5% used. |
| CSS on the English home | 2 files, 20,972 B raw, 5,017 B gzipped (tokens + layout + component styles) |
| HTML of the English home | 28,148 B raw, 6,664 B gzipped |
| Relocation check | `node scripts/check-relocatable.mjs`: dist copied to `<tmp>/x/y/z/`, 52 local references verified, 0 broken, 0 root-absolute; `index.html` and `pt/work/index.html` open from the nested folder |

Measurement commands: `gzip -c <script body> | wc -c` equivalent via `zlib.gzipSync` over each `<script>` body of `dist/index.html`; `du -sh dist`; `date` around `npm run build`.

## Self-check against SPEC.md acceptance tests (headless Chromium, file:// from a nested folder)

1. Nothing fixed is cut at the viewport edge on mobile (375px): pass — `document.scrollWidth === 375` at 320/375/390, header right edge = viewport, Menu button fully inside; the one offender found (status pill with `white-space: nowrap`) was fixed by letting the pill wrap.
2. Every case card is complete at rest, no hover needed: pass — home case slides show status, year, title, result, role, scope, three facts and the CTA/arrow at rest; /work cards show status, year, title, 4-line result, client and role; hover only raises the card 4px.
3. No variable-width headline element that can collide with buttons on mobile: pass — the header is a fixed-height grid (name | tools), the display headline lives in `<main>` below it, and `.slide__box > * { min-width: 0 }` keeps grid children from widening.
4. Theme: default dark without stored choice; toggle stamps `data-theme`, sets `aria-pressed="true"` for light, swaps the label, persists and survives reload: pass.
5. i18n: `<html lang="en">` / `lang="pt-BR"`, three `hreflang` alternates, language switch on `/work/` → `../pt/work/` and on `/pt/work/` → `../../work/`: pass.
6. Contact: conversation gets `.is-talking` when ≥50% visible, bubble 2 reaches opacity 1 after the stagger, Copy writes the email to the clipboard, label reads "Copied" then reverts to "Copy" after 1.5 s, chips are `mailto:…?subject=…`: pass.
7. Snap: `scroll-snap-type: y mandatory` on `<main>` on the home at 1440px, `none` on /work; About slide at 1280×680 keeps its top reachable and scrolls internally: pass.
8. Work cards: `-webkit-line-clamp: 4` at rest, `none` after activating the card (`:target`): pass.
9. No-JS: hero opacity 1, contact bubbles opacity 1, native cursor kept (`cursor: auto`): pass.
10. Skip link is the first Tab stop and targets `#main`; canvas and cursor are `aria-hidden`: pass.
11. Performance: 3.2 kB gzipped JS, no framework runtime, no images; Lighthouse itself was not run (no network/Chrome extension in this sandbox), the only runtime request besides the page's own files is the Google Fonts CSS.
12. Contrast: text uses `--fg` / `--fg-muted` only (≈6:1 dark, ≈5.5:1 light); `--fg-faint` is not used for text; inverse Contact derives muted/line colors from `--fg-inverse` with `color-mix` (≈5:1 for muted text on the light inverse ground).

## Deviations / things that are not 1:1 with the spec

- "Role", "Scope" and "Menu" are not in `shared/content/*.json`; they come from `src/lib/fallback-strings.ts` until the JSON gains `cases.roleLabel`, `cases.scopeLabel`, `nav.menu`.
- The reactive dot grid reacts on the whole page, not only in the hero (one fixed canvas; opaque sections cover it).
- Astro inlines the six module scripts into each page instead of emitting `/_astro/*.js` files (its default for per-page scripts). Same bytes, one fewer request each; the postbuild rewrite for `import("/...")` is therefore unused today but kept for when a script grows past Astro's inlining threshold.
- `hreflang` alternates are relative unless `SITE_URL` is passed at build time.

## DX assessment (for a designer editing JSON copy and CSS tokens, using AI for code)

1. Copy and tokens are truly the only things you touch day to day: every string is a JSON key, every color/size a token; the JSON is typed, so the editor flags a wrong key — but `astro build` does not type-check, so a typo renders as empty text unless you add `@astrojs/check` to the pipeline.
2. The `.astro` files read like HTML with a small front-matter block — easy to paste into an AI and easy to review the diff; there is no JSX, no hooks, no state library to understand.
3. Layout rules are split between one global sheet (slides, snap, corner marks) and scoped `<style>` blocks per component; you have to know which one owns what, and Astro's scoped-style specificity can surprise you when a global rule and a component rule collide.
4. Build feedback is fast (2.5 s) and the output is plain files you can open from a folder — but the postbuild/preview scripts are custom and undocumented by Astro, so an AI will not "know" them; the README explains them.
5. Vanilla `<script>` modules keep the page tiny but mean interactions are written by hand (observers, rAF, clipboard); adding a richer interaction later means more hand-written DOM code or opting into an island framework.
