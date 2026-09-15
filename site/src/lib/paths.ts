import type { Lang } from './content';

export type Page = 'home' | 'work';

/** Astro's base, normalised to always end with a slash ("/" or "/repo/"). */
const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : import.meta.env.BASE_URL + '/';

/** Root-absolute URL under the configured base. postbuild makes it relative. */
export function href(path = ''): string {
  return base + path.replace(/^\/+/, '');
}

/** URL of a page in a given language: "/", "/work/", "/pt/", "/pt/work/". */
export function pageHref(lang: Lang, page: Page, hash = ''): string {
  const langPart = lang === 'en' ? '' : `${lang}/`;
  const pagePart = page === 'home' ? '' : `${page}/`;
  return href(langPart + pagePart) + hash;
}

/** Prototype link to a case: /work/#slug (real site: /work/slug/). */
export function caseHref(lang: Lang, slug: string): string {
  return pageHref(lang, 'work', `#${slug}`);
}

export function mailto(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
