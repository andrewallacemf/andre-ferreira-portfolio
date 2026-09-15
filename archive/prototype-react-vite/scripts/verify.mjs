/**
 * Relocatability check: copies dist/ into a nested temp folder and verifies
 * that every href/src referenced by index.html and pt/work/index.html
 * (and the two other pages) resolves to an existing file relative to that page.
 * Root-absolute URLs ("/...") fail the check on purpose.
 */
import { cpSync, rmSync, readFileSync, existsSync, mkdtempSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const nest = join(mkdtempSync(join(tmpdir(), 'portfolio-')), 'a/b/c');
cpSync(dist, nest, { recursive: true });

const pages = ['index.html', 'work/index.html', 'pt/index.html', 'pt/work/index.html'];
const SKIP = /^(https?:|mailto:|#|data:|javascript:)/i;
let checked = 0;
const failures = [];

for (const page of pages) {
  const file = join(nest, page);
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (SKIP.test(url)) continue;
    checked++;
    if (url.startsWith('/')) {
      failures.push(`${page}: root-absolute ${url}`);
      continue;
    }
    const clean = url.split('#')[0].split('?')[0];
    let target = resolve(dirname(file), clean);
    if (clean.endsWith('/') || clean === '' || clean === '.') target = join(target, 'index.html');
    if (!existsSync(target)) failures.push(`${page}: ${url} → missing ${target.replace(nest, '')}`);
  }
}

rmSync(resolve(nest, '../../..'), { recursive: true, force: true });
if (failures.length) {
  console.error(`verify: ${failures.length} broken reference(s)\n  ` + failures.join('\n  '));
  process.exit(1);
}
console.log(`verify: ${checked} relative references resolve from a nested folder (${pages.length} pages).`);
