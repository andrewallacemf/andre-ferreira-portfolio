// Makes dist/ relocatable: rewrites every root-absolute URL (href="/x",
// src="/x", url(/x), import("/x"), and `${base}`-prefixed URLs) in html/css/js
// into a path relative to the file that contains it. No dependencies.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');
// The base Astro built with ("/" or "/repo/"); strip it too so output is portable.
let base = process.env.BASE_PATH ?? '/';
if (!base.startsWith('/')) base = '/' + base;
if (!base.endsWith('/')) base += '/';

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

/** "./" for files at dist root, "../" per extra directory level otherwise. */
function prefixFor(file) {
  const depth = path.relative(dist, path.dirname(file)).split(path.sep).filter(Boolean).length;
  return depth === 0 ? './' : '../'.repeat(depth);
}

/** Turn a root-absolute path ("/pt/work/") into a relative one for this file. */
function relativize(abs, prefix) {
  let rest = abs;
  if (base !== '/' && rest.startsWith(base)) rest = rest.slice(base.length);
  else rest = rest.replace(/^\/+/, '');
  return prefix + rest;
}

// Root-absolute but not protocol-relative ("//cdn...").
const ABS = String.raw`\/(?!\/)([^"'()\s>]*)`;
const patterns = [
  // href="/..." src="/..." (HTML attributes, double or single quotes)
  new RegExp(String.raw`\b(href|src|content)=(["'])${ABS}\2`, 'g'),
  // url(/...) with optional quotes (CSS and inline styles)
  new RegExp(String.raw`url\((["']?)${ABS}\1\)`, 'g'),
  // import("/...") and import('/...') (JS dynamic imports)
  new RegExp(String.raw`import\((["'])${ABS}\1\)`, 'g'),
];

function rewrite(text, prefix) {
  let out = text.replace(patterns[0], (_, attr, q, p) => `${attr}=${q}${relativize('/' + p, prefix)}${q}`);
  out = out.replace(patterns[1], (_, q, p) => `url(${q}${relativize('/' + p, prefix)}${q})`);
  out = out.replace(patterns[2], (_, q, p) => `import(${q}${relativize('/' + p, prefix)}${q})`);
  return out;
}

let files = 0, changed = 0;
for await (const file of walk(dist)) {
  if (!/\.(html|css|js|mjs)$/.test(file)) continue;
  files++;
  const src = await readFile(file, 'utf8');
  const out = rewrite(src, prefixFor(file));
  if (out !== src) { changed++; await writeFile(file, out); }
}
console.log(`[postbuild] relocated ${changed}/${files} files in ${path.relative(process.cwd(), dist) || '.'}`);
