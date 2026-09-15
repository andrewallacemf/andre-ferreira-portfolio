/**
 * preview/ = copy of dist/ where ONLY index.html (English home) becomes a
 * fragment: <title>, the Google Fonts <link>, every <link rel="stylesheet">,
 * every <style>, the body's inner HTML, then every <script> — in that order.
 * No doctype/html/head/body wrappers, no charset/viewport metas.
 * Every other file is byte-identical to dist/.
 */
import { cpSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const preview = resolve(root, 'preview');

rmSync(preview, { recursive: true, force: true });
cpSync(dist, preview, { recursive: true });

const html = readFileSync(resolve(dist, 'index.html'), 'utf8');
const head = (html.match(/<head[^>]*>([\s\S]*?)<\/head>/i) || [, ''])[1];
const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || [, ''])[1];

const all = (src, re) => Array.from(src.matchAll(re), (m) => m[0]);
const title = (head.match(/<title>[\s\S]*?<\/title>/i) || [''])[0];
const links = all(head, /<link\b[^>]*>/gi);
const fontsLink = links.filter((l) => /fonts\.googleapis\.com\/css/i.test(l) && /rel="stylesheet"/i.test(l));
const stylesheets = links.filter((l) => /rel="stylesheet"/i.test(l) && !fontsLink.includes(l));
const styles = all(head, /<style\b[^>]*>[\s\S]*?<\/style>/gi);
// Scripts from head and body, in document order (inline theme script + module entry).
const scripts = all(head, /<script\b[^>]*>[\s\S]*?<\/script>/gi).concat(all(body, /<script\b[^>]*>[\s\S]*?<\/script>/gi));
const bodyInner = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').trim();

const fragment = [title, ...fontsLink, ...stylesheets, ...styles, bodyInner, ...scripts].filter(Boolean).join('\n') + '\n';
writeFileSync(resolve(preview, 'index.html'), fragment);
console.log(`preview: index.html → fragment (${(fragment.length / 1024).toFixed(1)} kB); other files copied from dist/`);
