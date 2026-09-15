import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const shared = resolve(here, '../../shared');

// Copy for <title> / <meta description> comes from the shared JSON, never from the HTML.
const content = {
  en: JSON.parse(readFileSync(resolve(shared, 'content/en.json'), 'utf8')),
  pt: JSON.parse(readFileSync(resolve(shared, 'content/pt.json'), 'utf8')),
};

/** Fill %TITLE% / %DESCRIPTION% in each HTML entry from the JSON of its language. */
function htmlMetaFromJson() {
  return {
    name: 'portfolio:html-meta',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const file = (ctx.filename || ctx.path || '').replace(/\\/g, '/');
        const lang = /\/pt\//.test(file) ? 'pt' : 'en';
        const page = /\/work\//.test(file) ? 'work' : 'home';
        const c = content[lang];
        const title = page === 'work' ? `${c.work.title} · ${c.meta.title}` : c.meta.title;
        return html.replaceAll('%TITLE%', title).replaceAll('%DESCRIPTION%', c.meta.description);
      },
    },
  };
}

export default defineConfig({
  base: './',
  appType: 'mpa',
  plugins: [react(), htmlMetaFromJson()],
  server: { fs: { allow: [here, shared] } },
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        home: resolve(here, 'index.html'),
        work: resolve(here, 'work/index.html'),
        'pt-home': resolve(here, 'pt/index.html'),
        'pt-work': resolve(here, 'pt/work/index.html'),
      },
    },
  },
});
