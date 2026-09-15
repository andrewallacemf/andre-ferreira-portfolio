# Site (Astro)

Home page + `/work` of André Ferreira's portfolio, implemented in **Astro 5** with **zero UI framework**: `.astro` components rendered to static HTML, plus six tiny vanilla `<script>` modules (theme toggle, mobile menu, dot-grid canvas, custom cursor, slide reveal, contact conversation + copy button). Copy comes from `../shared/content/{en,pt}.json`, design tokens from `../shared/tokens.css`; both are imported, never copied.

## Stack

| Piece | Choice |
| --- | --- |
| Framework | `astro@5.18.2` (pinned), static output, `trailingSlash: 'always'` |
| Bundler | Vite 6.4.3 (ships with Astro) |
| UI runtime | none (no React/Vue/Svelte) |
| Styling | plain CSS: tokens + one global layout sheet + Astro-scoped `<style>` per component |
| Fonts | Instrument Sans via the Google Fonts `<link>` from SPEC.md; fallback stack from tokens |
| Dependencies | 1 direct (`astro`), 282 packages installed in total |

## How to run

```bash
cd site
npm install
npm run dev        # http://localhost:4321  (/, /work/, /pt/, /pt/work/)
npm run build      # astro build → scripts/postbuild.mjs (relocate URLs) → scripts/preview.mjs (preview/)
npm run check      # copies dist/ to a nested folder and verifies every local href/src resolves
npm run preview    # serves dist/ locally
```

Optional environment variables for `build`:

- `BASE_PATH=/andre-ferreira-portfolio/` — Astro base. Not required: `postbuild` rewrites every root-absolute URL in `dist/**/*.{html,css,js}` into a path relative to the file (`./`, `../`), so the same `dist/` works from any sub-path, a nested folder or `file://`.
- `SITE_URL=https://example.com` — makes the `<link hreflang>` alternates absolute (search engines require absolute URLs there). Without it they are relative.

## Where things live

```
astro.config.mjs          base/trailingSlash, Vite fs.allow for ../shared
scripts/postbuild.mjs     root-absolute → relative URL rewrite (no deps)
scripts/preview.mjs       preview/ = dist/ with index.html turned into a fragment
scripts/check-relocatable.mjs  nested-folder link check (exit 1 on any broken ref)
src/lib/content.ts        imports en.json / pt.json, typed helpers (featuredCases, statusLabel…)
src/lib/paths.ts          pageHref(lang, page), caseHref, mailto — all links go through here
src/styles/global.css     layout system: header height, slides, snap, corner marks, pill, reveal
src/layouts/BaseLayout.astro  <head> (fonts, hreflang, theme-before-paint script), skip link, canvas, header, cursor
src/views/Home.astro      composes the 7 home slides for a given lang
src/views/Work.astro      /work page
src/pages/{index,work}.astro, src/pages/pt/{index,work}.astro   3-line wrappers: <Home lang="pt" />
src/components/           Header, ThemeToggle, Hero, CaseSlide, Principles, About, Contact, Footer,
                          WorkGrid, DotGrid, Cursor, CornerMarks
```

To change copy: edit `shared/content/*.json`. To change colors/type/space: edit `shared/tokens.css`. No component contains a hex color or a copy string.

## What is implemented (SPEC.md, section by section)

- **Header** fixed; name / nav (Work, About, Contact) / language switch (EN↔PT, same page) + theme toggle. Mobile: name + compact row (lang, theme, Menu button with `aria-expanded`) revealing the three links.
- **Hero**: three display lines, `sub` (52ch), `now` line with a 6px pulsing dot, `status` as a hairline pill, `meta.location` and `©meta.year` in the bottom corners, "Scroll" hint bottom-center on desktop only.
- **Three case slides** from `cases.featured`: status pill + year eyebrow, title, italic result, Role/Scope definition list, three big-number fact tiles, "View case" CTA (→ `/work/#slug`, accent color: the one accented CTA). Right column: hairline-bordered dotted panel with corner marks and the three numbers rendered large. On desktop the slide is not a link; on touch a full-card link overlay with a ↗ arrow top-right replaces the CTA.
- **Principles**: label + 7 quotes with a left hairline; alternating offsets on desktop, stacked on mobile.
- **About** (`#about`): p1–p3 left; eras list + "Worked with" chips right. On desktop the slide scrolls internally when taller than the viewport (auto margins instead of `align-content: center`, so the top never becomes unreachable).
- **Contact** (`#contact`, inverse ground in both themes): title; conversation block (two bubbles with a 400ms stagger + chips, revealed once the section is ≥50% visible; visible at rest without JS or with reduced motion); each chip is `mailto:EMAIL?subject=…`; always-visible list of Email (+ Copy button → "Copied" for 1.5s), LinkedIn, Résumé (`#` placeholder), Medium; footer line + "Source on GitHub".
- **/work**: title + intro, responsive grid (3/2/1 columns) of all 8 cases, cards with status, year, title, result clamped to 4 lines, client label, Role. Card = link to `#slug`; `:target` lifts the clamp (tap on touch, click on desktop), hover raises 4px on desktop, cursor label "View".
- **Cross-cutting**: custom cursor (desktop pointer only, `hover:hover and pointer:fine and ≥1024px`, native cursor hidden only once the script runs; 12px dot with lerp, 64px `mix-blend-mode: difference` circle with a `data-cursor` label over `a`, `button`, `[data-cursor]`); dot-grid canvas (fixed, 28px spacing, dots within 140px of the pointer scale to 2.2× and blend toward `--grid-dot-hot`, colors read from computed CSS variables and refreshed on theme change, rAF-throttled, static on touch/reduced motion); theme (default dark, stamped on `<html>` before first paint, persisted in `localStorage("theme")` inside try/catch, `aria-pressed` on the button); i18n (`/`, `/work/`, `/pt/`, `/pt/work/`, `lang`, `hreflang` alternates, switch preserves page); motion (12px/320ms slide reveal via IntersectionObserver, content visible at rest, 2s safety net, reduced motion respected); accessibility (skip link, landmarks, `:focus-visible` ring from tokens, `aria-hidden` on canvas/cursor/arrows).
- **Scroll snap** on the home at ≥1024px: `<main>` is the scroll container (`100dvh`, `scroll-snap-type: y mandatory`); each slide pads its top by the header height. `/work` is a normal flowing document.
- **Build output**: relocatable `dist/`, `preview/` fragment as specified, pinned versions, `dev`/`build`/`preview` scripts.

## Known gaps / decisions to review

1. ~~Three labels not in the shared JSON~~ Resolved: `cases.roleLabel`, `cases.scopeLabel` and `nav.menu` now live in `shared/content/*.json`; `fallback-strings.ts` was removed.
2. `hreflang` links are relative unless `SITE_URL` is set at build time.
3. The dot-grid pointer interaction runs on the whole page, not only in the hero (the canvas is one fixed layer; sections with their own background, like Contact, cover it).
4. Résumé links to `#` and "Source on GitHub" to `https://github.com/` (placeholders per spec).
5. Unused JSON keys: `nav.allWork`, `cases.ctaAll`, `cases.sectionLabel`, `work.filterAll` (no section in SPEC.md uses them).
6. In `preview/index.html` the theme-before-paint script is, by the required fragment order, after the body content; the preview host may show one dark→light frame for visitors who stored the light theme.
7. No images, analytics or case pages yet (out of scope for the prototype).
