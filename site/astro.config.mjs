// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// Astro needs an absolute `base`. We build with `/` (or BASE_PATH when given)
// and `scripts/postbuild.mjs` rewrites every root-absolute URL in dist/ into a
// path relative to the file that references it, so the output works from any
// sub-path (GitHub Pages under /repo/, a nested preview folder, file://).
const base = process.env.BASE_PATH ?? '/';
// Optional: absolute site origin, only used for <link hreflang> alternates.
const site = process.env.SITE_URL;

// The repo root (../ from this folder): shared/tokens.css and shared/content
// are imported from there, so Vite's dev server must be allowed to read it.
const repoRoot = fileURLToPath(new URL('../', import.meta.url));

export default defineConfig({
  base,
  ...(site ? { site } : {}),
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
    assets: '_astro',
  },
  vite: {
    server: { fs: { allow: [repoRoot] } },
  },
});
