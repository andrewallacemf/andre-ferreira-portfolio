// Renders the Open Graph images (1200×630) and the raster favicons with
// Playwright, from the site's tokens and copy. Run locally when copy changes:
//   node scripts/og.mjs [path/to/SchibstedGrotesk.ttf]   (needs playwright; PLAYWRIGHT_PKG may point to it)
// Output: public/og/<lang>-<page>.png, public/apple-touch-icon.png, public/favicon-32.png
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PKG ?? 'playwright');
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const out = path.join(root, 'public', 'og');
mkdirSync(out, { recursive: true });
const fontPath = process.argv[2];
const fontCss = fontPath
  ? `@font-face { font-family: "Schibsted Grotesk"; src: url("data:font/ttf;base64,${readFileSync(fontPath).toString('base64')}"); font-weight: 400 900; }`
  : '';

const en = JSON.parse(readFileSync(path.join(root, '..', 'shared', 'content', 'en.json'), 'utf8'));
const pt = JSON.parse(readFileSync(path.join(root, '..', 'shared', 'content', 'pt.json'), 'utf8'));
const content = { en, pt };
const loadCase = (lang, slug) => { try { return JSON.parse(readFileSync(path.join(root, '..', 'shared', 'content', 'cases', `${slug}.${lang}.json`), 'utf8')); } catch { return null; } };

/* One card per page: name top-left, big title, a quiet line at the bottom. */
const cards = [];
for (const lang of ['en', 'pt']) {
  const t = content[lang];
  cards.push({ key: `${lang}-home`, lang, title: `${t.hero.line1} ${t.hero.line2} ${t.hero.line3}`, foot: t.hero.now.replace(/^Now: |^Agora: /, '') });
  cards.push({ key: `${lang}-work`, lang, title: t.work.title, foot: t.work.intro });
  cards.push({ key: `${lang}-method`, lang, title: t.method.title, foot: t.method.lede });
  for (const c of t.cases.items) {
    cards.push({ key: `${lang}-${c.slug}`, lang, title: c.title, foot: `${c.client} · ${c.year}`, kicker: loadCase(lang, c.slug) ? null : null });
  }
}

const html = (card) => `<!doctype html><html><head><meta charset="utf-8"><style>
${fontCss}
:root { --bg:#0e0f12; --fg:#e9eaee; --muted:#8d919b; --line:#3a3e48; --dot:rgba(233,234,238,.10); --accent:#4f7dff; }
* { box-sizing: border-box; margin: 0; }
body { width:1200px; height:630px; background:var(--bg); color:var(--fg); font-family:"Schibsted Grotesk","Helvetica Neue",Arial,sans-serif; -webkit-font-smoothing:antialiased;
  background-image: radial-gradient(var(--dot) 1.6px, transparent 2px); background-size: 28px 28px; background-position: 14px 14px; }
.box { position:absolute; inset:56px; padding:52px 64px; display:flex; flex-direction:column; justify-content:space-between; gap:24px; }
.corner { position:absolute; width:22px; height:22px; border:0 solid var(--line); }
.c1{top:0;left:0;border-top-width:2px;border-left-width:2px} .c2{top:0;right:0;border-top-width:2px;border-right-width:2px}
.c3{bottom:0;left:0;border-bottom-width:2px;border-left-width:2px} .c4{bottom:0;right:0;border-bottom-width:2px;border-right-width:2px}
.name { font-size:26px; font-weight:500; letter-spacing:-0.01em; display:flex; align-items:center; gap:14px; }
.name i { width:12px; height:12px; border-radius:50%; background:var(--accent); display:inline-block; }
h1 { font-size:${card.title.length > 60 ? 58 : card.title.length > 28 ? 76 : 96}px; line-height:1.06; margin-block:24px 32px; font-weight:700; letter-spacing:-0.03em; text-wrap:balance; max-width:1000px; }
.foot { font-size:26px; color:var(--muted); line-height:1.35; max-width:900px; display:flex; justify-content:space-between; align-items:flex-end; gap:40px; }
.foot span:last-child { white-space:nowrap; color:var(--line); font-size:22px; letter-spacing:.08em; text-transform:uppercase; }
</style></head><body><div class="box">
<i class="corner c1"></i><i class="corner c2"></i><i class="corner c3"></i><i class="corner c4"></i>
<div class="name"><i></i>${card.lang === 'pt' ? pt.hero.name : en.hero.name}</div>
<h1>${card.title}</h1>
<div class="foot"><span>${card.foot}</span><span>${card.lang === 'pt' ? 'Brasília · 2026' : 'Brasília · 2026'}</span></div>
</div></body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const card of cards) {
  await page.setContent(html(card));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, `${card.key}.png`), type: 'png' });
}
/* Raster favicons from the SVG (Safari and old tabs do not read SVG icons). */
const svg = readFileSync(path.join(root, 'public', 'favicon.svg'), 'utf8').replace(/@media[^}]*\}[^}]*\}/s, '');
for (const [name, size] of [['apple-touch-icon.png', 180], ['favicon-32.png', 32]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0;background:#0e0f12">${svg.replace('viewBox', `width="${size}" height="${size}" viewBox`)}</body>`);
  await page.screenshot({ path: path.join(root, 'public', name), type: 'png', omitBackground: false });
}
await browser.close();
console.log(`[og] ${cards.length} cards + 2 icons written`);
