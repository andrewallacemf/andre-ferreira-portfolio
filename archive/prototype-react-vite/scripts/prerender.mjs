/**
 * Static pre-render (SSG by hand): renders the same React components with
 * react-dom/server and injects the markup into each built HTML so every page
 * is readable without JS. The client then hydrates (src/main.jsx).
 *
 * Runs after `vite build` (client) and `vite build --ssr` (→ .vite/ssr/).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const ssrEntry = resolve(root, '.vite/ssr/entry-server.js');

if (!existsSync(ssrEntry)) {
  console.error(`prerender: missing ${ssrEntry}. Run "vite build --ssr src/entry-server.jsx --outDir .vite/ssr" first.`);
  process.exit(1);
}
const { render } = await import(pathToFileURL(ssrEntry).href);

const pages = [
  { file: 'index.html', lang: 'en', page: 'home' },
  { file: 'work/index.html', lang: 'en', page: 'work' },
  { file: 'pt/index.html', lang: 'pt', page: 'home' },
  { file: 'pt/work/index.html', lang: 'pt', page: 'work' },
];

const ROOT_RE = /(<div id="root"[^>]*>)\s*(<\/div>)/;

for (const p of pages) {
  const path = resolve(dist, p.file);
  const html = readFileSync(path, 'utf8');
  const markup = await render(p.lang, p.page);
  if (!ROOT_RE.test(html)) throw new Error(`prerender: empty #root not found in ${p.file}`);
  const out = html.replace(ROOT_RE, (_, open, close) => `${open}${markup}${close}`);
  writeFileSync(path, out);
  console.log(`prerender: ${p.file} (${(markup.length / 1024).toFixed(1)} kB of markup)`);
}
