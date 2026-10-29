/* sitemap.xml with hreflang alternates, built from the same route helpers the
   pages use, so a new case or language shows up here without extra work. */
import type { APIRoute } from 'astro';
import type { Lang } from '../lib/content';
import { caseSlugsWithPage } from '../lib/content';
import { absHref, pageHref, type Page } from '../lib/paths';

const langs: Lang[] = ['en', 'pt'];

export const GET: APIRoute = ({ site }) => {
  const abs = (p: string) => absHref(p, site!);
  const entries: { page: Page; slug?: string }[] = [{ page: 'home' }, { page: 'work' }, { page: 'method' }];
  const slugs = caseSlugsWithPage('en').filter((s) => caseSlugsWithPage('pt').includes(s));
  for (const slug of slugs) entries.push({ page: 'case', slug });

  const url = (e: { page: Page; slug?: string }, lang: Lang) => {
    const alts = langs
      .map((l) => `    <xhtml:link rel="alternate" hreflang="${l === 'pt' ? 'pt-BR' : 'en'}" href="${abs(pageHref(l, e.page, '', e.slug))}"/>`)
      .join('\n');
    return `  <url>\n    <loc>${abs(pageHref(lang, e.page, '', e.slug))}</loc>\n${alts}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(pageHref('en', e.page, '', e.slug))}"/>\n  </url>`;
  };

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.flatMap((e) => langs.map((l) => url(e, l))).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
