// Builds preview/ next to dist/: an exact copy where only index.html (the
// English home) becomes a fragment, in this order: <title>, the Google Fonts
// <link>, every <link rel="stylesheet">, every <style>, the body's inner HTML,
// then every <script>. No doctype/html/head/body wrappers, no metas.
import { cp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');
const preview = path.resolve(process.argv[3] ?? 'preview');

const html = await readFile(path.join(dist, 'index.html'), 'utf8');

const all = (re) => Array.from(html.matchAll(re), (m) => m[0]);
const title = all(/<title>[\s\S]*?<\/title>/gi).slice(0, 1);
const links = all(/<link\b[^>]*>/gi);
const fonts = links.filter((l) => /fonts\.googleapis\.com\/css/i.test(l));
const stylesheets = links.filter((l) => /rel=["']stylesheet["']/i.test(l) && !fonts.includes(l));
const styles = all(/<style\b[^>]*>[\s\S]*?<\/style>/gi);
const scripts = all(/<script\b[^>]*>[\s\S]*?<\/script>/gi);

const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) throw new Error('[preview] dist/index.html has no <body>');
// Scripts are appended at the end, so strip them from the body copy.
const bodyInner = bodyMatch[1].replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').trim();

const fragment = [...title, ...fonts, ...stylesheets, ...styles, bodyInner, ...scripts].join('\n') + '\n';

await rm(preview, { recursive: true, force: true });
await cp(dist, preview, { recursive: true });
await writeFile(path.join(preview, 'index.html'), fragment);

console.log(
  `[preview] ${path.relative(process.cwd(), preview)}/index.html: ` +
    `${title.length} title, ${fonts.length} font link, ${stylesheets.length} stylesheet(s), ` +
    `${styles.length} style block(s), ${scripts.length} script(s)`,
);
