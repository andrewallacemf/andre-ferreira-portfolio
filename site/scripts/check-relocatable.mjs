// Copies dist/ into a nested folder (x/y/z) and verifies that every local
// href/src/url()/import() in each HTML/CSS/JS file resolves to an existing
// file from that file's own location. Exits 1 on any broken or root-absolute
// reference. Usage: node scripts/check-relocatable.mjs [dist] [scratchDir]
import { cp, readdir, readFile, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');
const scratch = path.resolve(process.argv[3] ?? path.join(os.tmpdir(), 'relocatable-check'));
const nested = path.join(scratch, 'x', 'y', 'z');

await rm(scratch, { recursive: true, force: true });
await cp(dist, nested, { recursive: true });

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}
const exists = async (p) => {
  try {
    const s = await stat(p);
    return s.isFile() || (s.isDirectory() && (await stat(path.join(p, 'index.html'))).isFile());
  } catch { return false; }
};

const refRe = /(?:\b(?:href|src)=["']([^"']+)["'])|(?:url\(["']?([^"')]+)["']?\))|(?:import\(["']([^"']+)["']\))/g;
const skip = (u) => /^(https?:|mailto:|tel:|data:|#|\/\/)/i.test(u) || u === '';

let checked = 0, broken = [], absolute = [];
for await (const file of walk(nested)) {
  if (!/\.(html|css|js)$/.test(file)) continue;
  const text = await readFile(file, 'utf8');
  for (const m of text.matchAll(refRe)) {
    const raw = (m[1] ?? m[2] ?? m[3]).trim();
    if (skip(raw)) continue;
    const clean = raw.split('#')[0].split('?')[0];
    if (clean.startsWith('/')) { absolute.push(`${path.relative(nested, file)} -> ${raw}`); continue; }
    checked++;
    const target = path.resolve(path.dirname(file), clean);
    if (!(await exists(target))) broken.push(`${path.relative(nested, file)} -> ${raw}`);
  }
}

const rel = (p) => path.relative(nested, p);
for (const must of ['index.html', path.join('pt', 'work', 'index.html')]) {
  const ok = await exists(path.join(nested, must));
  console.log(`[check] ${ok ? 'ok ' : 'MISSING'} ${rel(path.join(nested, must))} (served from ${nested})`);
}
console.log(`[check] ${checked} local references verified, ${broken.length} broken, ${absolute.length} root-absolute`);
for (const b of broken) console.log('  broken:   ' + b);
for (const a of absolute) console.log('  absolute: ' + a);
process.exit(broken.length || absolute.length ? 1 : 0);
