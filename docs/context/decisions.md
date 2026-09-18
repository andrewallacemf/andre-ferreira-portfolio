# Decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-09-05 | GitHub + GitHub Pages, static site, public repo | The repo is also a showcase; no vendor lock-in; free |
| 2026-09-05 | Dark default, light available | Client (André) directive |
| 2026-09-05 | Design directly in code, no Figma-first | André's process choice; the site is itself proof of design-to-code work |
| 2026-09-05 | Stack decided after a prototype in two stacks | Compare DX and result, not opinions |
| 2026-09-15 | One shared source: `shared/tokens.css` + `shared/content/{en,pt}.json` | Both prototypes must differ only in stack, never in design or copy |
| 2026-09-15 | Typeface: Instrument Sans, single family, weights 400/500 | Neutral grotesque per André's choice; personality comes from motion and detail; avoids the default Inter/Space Grotesk look |
| 2026-09-15 | Accent: blueprint blue (#4f7dff dark / #2f5be0 light), used sparingly | Ties to the "blueprint/crafting" cue André wants; avoids the near-black + acid-green cliché |
| 2026-09-15 | Home = 3 featured cases; `/work` = all cases | André's decision; keeps the slide home short and lets the catalogue grow |
| 2026-09-15 | Custom cursor only for `hover:hover and pointer:fine` at ≥1024px; every target keeps a visible affordance | Reference analysis: cursor labels are never the only affordance |
| 2026-09-15 | Builds must be sub-path safe (relative URLs) | GitHub Pages serves under `/<repo>/`; previews live elsewhere |
| 2026-09-15 | Stack: **Astro** (`site/`); the React + Vite prototype is kept in `archive/prototype-react-vite/` | Same result with 3.2 kB vs 76.8 kB of JS, one dependency, `.astro` files read like HTML; André accepted the recommendation |
| 2026-09-18 | Typeface: **Schibsted Grotesk**, body 400, UI 500, titles 700 | André's pick after the Impeccable review flagged Instrument Sans as saturated; he asked for bolder titles |
| 2026-09-18 | Impeccable refinement: no kickers, no section numbers, no stat tiles, no identical card grids, no chips, one authored entrance | See SPEC.md "Impeccable review" |
