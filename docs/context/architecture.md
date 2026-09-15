# Architecture (phase 4)

```
shared/                      one source of truth
  tokens.css                 design tokens + base styles
  content/en.json, pt.json   all copy, cases, labels
  SPEC.md                    behaviour spec of the site
site/                        the Astro site (chosen stack)
archive/prototype-react-vite/ Prototype B from the stack comparison, kept for the record; not built or deployed
docs/                        this folder
.github/workflows/deploy.yml Pages deploy; SITE_DIR=site
```

## Where to change what

| I need to… | Go to |
|---|---|
| Change a word, a case description, a label | `shared/content/en.json` and `pt.json` (both!) |
| Change a color, spacing, type size | `shared/tokens.css` |
| Change how a section behaves or looks | `site/src/components/*.astro` (see `site/README.md`) |
| Add a case to `/work` | append an item to `cases.items` in both JSON files |
| Feature a different case on the home | edit `cases.featured` (3 slugs) in both JSON files |
| Change the deploy target | `SITE_DIR` in `.github/workflows/deploy.yml` |

## Conventions
- Components: PascalCase. CSS: tokens only, no hex in components. Files under 300 lines.
- Every string comes from JSON; every color from a token.
