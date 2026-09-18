# Prototype spec — home + /work (same behaviour in both stacks)

The site (`site/`, Astro) implements exactly this; the archived React prototype did too. Content comes from `shared/content/{en,pt}.json`; tokens from `shared/tokens.css`. Do not invent copy; do not add sections. English is the default language; Portuguese lives under `/pt/`.

## Design plan

- **Color:** dark-first. Ground `#0e0f12`, elevated `#15171c`, text `#e9eaee`, muted `#8d919b`, hairline `#262931`, accent blueprint blue `#4f7dff`. Light theme in tokens. The accent is used sparingly: cursor label hot state, the reactive dots near the pointer, focus ring, one CTA. Everything else is monochrome. Status pills are hairline-outlined, not filled.
- **Type:** one family, Schibsted Grotesk (Google Fonts, `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&display=swap">`; chosen 2026-09-18, replacing Instrument Sans). Weights: body 400 (`--weight-body`), UI and small titles 500 (`--weight-ui`), display and section titles 700 (`--weight-display`); display lines at `--text-2xl`, tracking -0.03em, tight leading, `text-wrap: balance`. Uppercase labels with `letter-spacing: 0.08em`. Numbers `tabular-nums`.
- **Layout concept:** garri.design as spine. Desktop (≥1024px): full-viewport sections with CSS `scroll-snap-type: y mandatory` on the scroll container; each section is a slide with text column left (max 62ch) and visual column right; corner marks (short L-shaped hairlines, 14px) at the four corners of each slide's content box as the blueprint signature. Mobile (<1024px): no snap, sections stack with generous `padding-block`, visual above or below text, full-width. A dotted grid (`--grid-dot`) sits behind the whole page as a fixed canvas; in the hero, dots within ~140px of the pointer scale up and take `--grid-dot-hot` (desktop only; static on touch).

## Sections (home, in order)

1. **Header** (fixed, top): left = name (link to home); center = nav (Work → `/work`, About → `#about`, Contact → `#contact`); right = language switch (EN↔PT, links to the same page in the other language) and theme toggle (button, aria-pressed, persists in `localStorage("theme")`, default dark). On mobile: name + a compact row with lang, theme and a "Menu" button that reveals the three links.
2. **Hero** (slide 1): three display lines (`hero.line1..3`), then `hero.sub` (muted, max 52ch), then `hero.now` as a small "live" line with a 6px dot, and `hero.status` as a hairline pill. Bottom corners: `meta.location` left, `©meta.year` right (small labels). A "Scroll" hint bottom-center on desktop only.
3. **Three case slides** (slides 2–4) for `cases.featured` in order. Each: eyebrow row = status pill + `year` (label); `title` (`--text-xl`); `result` (body, italic, max 62ch); meta list as a two-column definition list: Role, Scope (labels uppercase); the `facts` as three "big number" tiles (number `--text-lg` 500, caption `--text-sm` muted) laid horizontally desktop / 3-up compact on mobile; CTA link "View case" → `/work/<slug>` (prototype: link to `/work#<slug>`). Right column: a **placeholder visual**: a hairline-bordered panel with the dotted grid inside, the corner marks, and the case's three numbers rendered large in the panel (this stands in for the real screenshot; keep it handsome). On desktop the whole slide is NOT a link; on touch the whole card is a link with a ↗ arrow top-right (garri pattern).
4. **Principles** (slide 5): `principles.sectionLabel` + the 7 quotes as a vertical list on desktop (alternating left/right offset is fine) and simple stacked list on mobile; each quote `--text-lg`, weight 400, with a thin left hairline. No numbering.
5. **About + path** (slide 6, may scroll internally on short screens; do not clip): `about.p1..p3` on the left (62ch); on the right the 4 `timeline.eras` as a vertical list (era name 500, years label, one line of text) and, below, `timeline.clientsLabel` + `clients` as a wrapped row of text chips (hairline). Anchor `id="about"`.
6. **Contact** (slide 7, inverse ground: `--bg-inverse` / `--fg-inverse`, garri's dark footer inverted for both themes): `contact.title` (`--text-xl`); a **conversation block**: two bubbles (`bubble1`, `bubble2`) appearing with a 400ms stagger the first time the section is ≥50% visible (visible at rest if reduced motion), then three chips; each chip is an `<a href="mailto:EMAIL?subject=SUBJECT">`. Below, always visible: plain list of Email (with a Copy button that copies to clipboard and swaps label to `contact.copied` for 1.5s), LinkedIn (https://linkedin.com/in/andrewallacemf), Résumé (href `#` placeholder); the footer's top rule is the only divider after the last item. No Medium link: the full cases live on this site (`/work/<slug>`, phase 4); Medium is a backup only. Anchor `id="contact"`. Footer line `footer.line` + `footer.source` (href https://github.com/andrewallacemf/andre-ferreira-portfolio) in small labels.

## /work page

Header identical. `work.title` (`--text-2xl`) + `work.intro`. Then a responsive grid (3 cols ≥1024, 2 cols ≥640, 1 col below) of all 8 `cases.items` in the JSON order. Card: status pill + year, title, result (clamp to 4 lines with `-webkit-line-clamp`; full text available via title attribute is NOT enough: on touch, tapping the card expands it; on desktop hover raises the card 4px and reveals nothing new), client label, meta Role. Each card has `id=<slug>`. Cards are links to `#<slug>` in the prototype. Whole card is the link target on touch; on desktop the cursor label says "View".

## Cross-cutting behaviour

- **Custom cursor (desktop only, `@media (hover:hover) and (pointer:fine)` and width ≥1024):** hide native cursor on the page (`cursor: none`); a 12px circle in `--cursor` follows the pointer with a slight lerp; over interactive targets (`a`, `button`, `[data-cursor]`) it grows to a 64px circle with `mix-blend-mode: difference` and shows a label from `data-cursor` (`cursor.view`, `cursor.copy`, `cursor.open`). Never the only affordance: every target also has visible text or an arrow.
- **Theme:** default dark; toggle stamps `data-theme` on `<html>` and stores it; on first load, if no stored choice, keep dark (do NOT follow OS light automatically for the prototype: the client asked dark by default; the tokens still support OS light when unstamped, which is fine).
- **i18n:** two static builds of every page: `/` (en) and `/pt/` (pt), `/work/` and `/pt/work/`. `<html lang>` correct; `hreflang` alternate links in head; language switch preserves the current page.
- **Motion:** slide contents fade/translate in 12px over 320ms when the slide enters, from a visible resting state (opacity ≥ 0.001 only during the first frame; never leave content invisible without JS). Respect `prefers-reduced-motion`.
- **Accessibility:** skip link; landmarks; all interactive elements keyboard-reachable with visible focus; color contrast AA on both themes; the cursor is `aria-hidden`; the canvas grid is decorative (`aria-hidden`).
- **Acceptance tests from the reference analysis:** (1) nothing fixed gets cut at the viewport edge on mobile (375px); (2) every case card is complete at rest, no hover needed; (3) no variable-width headline element that can collide with buttons on mobile.
- **Performance:** no framework runtime on the page beyond what the stack strictly needs; total JS on the home under 60 kB gzipped for Astro (islands only for cursor/canvas/toggle/contact) and as low as reasonable for React. Images: none in the prototype (placeholder panels are CSS).

## Build output requirements

- `npm run build` produces a static `dist/` that works when served from **any sub-path** (GitHub Pages under `/andre-ferreira-portfolio/` and a private preview). Use relative URLs for all assets and internal links (`./`, `../`), or a post-build step that rewrites root-absolute paths to relative. Verify by opening `dist/index.html` and `dist/pt/work/index.html` from a nested folder path.
- Also produce `preview/` next to `dist/`: a copy of `dist/` where **only `index.html`** (the English home) is turned into a *fragment*: remove `<!doctype>`, `<html>`, `<head>`, `<body>` wrappers; keep, in this order, `<title>`, the Google Fonts `<link>`, every `<link rel="stylesheet">`, every `<style>`, then the body's inner HTML, then every `<script>` (module scripts included). Do not include charset/viewport metas. All other files in `preview/` stay identical to `dist/`. (The preview host wraps that one fragment in its own skeleton; sibling pages are served raw.)
- Keep `package.json` scripts: `dev`, `build`, `preview`. Pin versions.

## Docs

Each prototype ships a `README.md` (stack, how to run, what is implemented, known gaps) and a `NOTES.md` with: total build time, output size (`du -sh dist`), gzipped JS on the home, number of dependencies, and a 5-line honest assessment of DX for a designer who edits copy in JSON and CSS tokens and uses AI to change code.


## Amendments (2026-09-15, after André's review of the live site)

- **No status labels** (Shipped / In production / …) anywhere: André does not want delivery state shown. `cases.statusLabels` stays in the JSON but nothing renders it.
- **Tags on /work cards**: each case has `tags` (2–4 short labels of the kinds of work involved, e.g. Research, Design system, Usability testing) rendered as small outlined chips under Client/Role.
- **Cursor**: the 12px dot is white with `mix-blend-mode: difference` (visible on any ground); the hot 64px state does **not** invert: it is a near-opaque (90%) bubble in the theme cursor color with `backdrop-filter: blur(6px)`, so the label reads over text. On sections marked `data-ground="inverse"` (Contact) the bubble colors flip (`.is-inverse`). Native cursor hidden globally with `cursor: none !important` while the custom cursor is active.

## Case pages (phase 4, from 2026-09-15)

`/work/<slug>/` and `/pt/work/<slug>/`, generated only for cases with a body file in `shared/content/cases/`. Structure: header (back link, year, client, title from `cases.items`, `lede`, role/scope, tags) → hero figure → sections (each: numbered label, title, paragraphs, optional bullets / numbered steps / decision cards / facts grid / figure) → next case card → back link → footer. Normal flowing document; sticky section index at ≥1024px. Figures are placeholders (dotted panel + caption describing the image) until real assets exist. Language switch and `hreflang` keep the slug. Cards on `/work` and the home CTA link to the page when it exists, otherwise to the card anchor.

## "How I work" page (phase 4, 2026-09-15)

`/how-i-work/` and `/pt/como-trabalho/` (localized slugs, `Page = 'method'`), linked from the header nav (`nav.method`). Content in `method` of the shared JSON: title, lede and sections (label, title, paragraphs, optional `evidence` facts). Same reading layout as a case page (sticky index at ≥1024px), ends with a link to /work and the footer. Language rule applies with full force: André does not write code; AI carries the design into code; no single AI vendor named.

## Impeccable review (2026-09-18)

Refinement pass with the Impeccable design skill and detector (impeccable.style), preserving the visual world (dark default, blueprint dot grid, corner marks, Instrument Sans). Detector findings went from 131 to 22, all of them the "overused font" advisory. What changed:

- **No kickers/eyebrows above headings** anywhere (section labels, "Contact", "Como trabalho" duplicate, "01 · Contexto"). Headings carry themselves; the sticky index keeps the short labels. Section headings on the home (About, Path, Worked with, How I design) are real headings in sentence case, not uppercase tracked labels.
- **No section numbering** (case index "01", "01 · Contexto"). Process steps stay numbered because the sequence is the information.
- **No stat tiles / hero-metric template.** Facts are hairline rows (number, then caption) on case slides, case pages and the method page; captions in sentence case.
- **No identical card grids.** `/work` is an index of hairline rows (year and client left; title, result, role and kinds of work right). Decisions and findings are a hairline definition list. "Next case" is a hairline block, not a card. Tags and client names are text runs separated by middle dots, not chips.
- **Hero:** static accent dot (no pulse), status as plain text (no pill). The home case slide's right panel is the case's hero figure slot (placeholder + caption), not a repeat of the numbers.
- **Motion:** one authored entrance (hero: opacity, 14px lift, blur, exponential ease-out); no per-section fade-in. Contact keeps its conversation stagger. Cursor scales with `transform` (no width/height transition).
- **Type:** `--leading-snug` 1.35, `--leading-tight` 1.1, `.title-xl` 1.15 with balanced wrapping; lede 1.4; footer line in sentence case.
- **Browser surfaces:** `::selection`, caret and scrollbar themed from tokens; `.num` uses tabular numerals.
- **Layout:** `overflow-x: clip` on `main` instead of `body`.
- **Kept on purpose (brief wins):** dot-grid canvas and corner marks (blueprint world from the references), the header's blur (functional, content scrolls under it), the cursor bubble's blur (a specific effect), the typeface decision was left to André; on 2026-09-18 he chose Schibsted Grotesk with bold titles (see Type above).

## Wide-screen and interaction pass (2026-09-18, after André's Chrome review at 2560×1305)

- **Scale:** the root font-size grows at ≥1920px (112.5%) and ≥2400px (125%). Everything is in rem, so type, space, the 80rem box and the 62ch measure scale together; laptops and phones are unchanged.
- **Header flips over inverse ground:** while a `[data-ground="inverse"]` section sits under the header's lower edge, the header takes `.is-inverse` (and `data-ground="inverse"` for the cursor) and swaps its tokens, instead of staying a band of the opposite tone.
- **Slide rail (home, ≥1024px):** `SlideIndex` is a fixed rail on the right with one mark per slide (`#intro`, `#case-<slug>`, `#principles`, `#about`, `#contact`); the current mark is a short accent bar; hovering the rail reveals the names (`hero.name`, `cases.items[].short`, section labels, `nav.contact`; aria-label `nav.sections`). Click scrolls the snap container. Opts out of the cursor bubble with `data-cursor-quiet`. Mobile scrolls normally and has no rail.
- **Scrollspy:** the sticky index on case and method pages marks the current section (`aria-current`, accent left bar on a hairline).
- **/work rows:** the case's first fact (number + caption) is a third column at ≥1024px and a compact line below the text on narrower screens.
- **Case hero placeholder:** capped at `min(56vh, 34rem)` until the real image exists.
