import type { Lang } from './content';

export type Page = 'home' | 'work' | 'case' | 'method';

/** The method page has a localized slug. */
const METHOD_SLUG: Record<Lang, string> = { en: 'how-i-work', pt: 'como-trabalho' };

/** Astro's base, normalised to always end with a slash ("/" or "/repo/"). */
const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : import.meta.env.BASE_URL + '/';

/** Root-absolute URL under the configured base. postbuild makes it relative. */
export function href(path = ''): string {
  return base + path.replace(/^\/+/, '');
}

/** URL of a page in a given language: "/", "/work/", "/pt/", "/pt/work/", "/work/<slug>/". */
export function pageHref(lang: Lang, page: Page, hash = '', slug?: string): string {
  const langPart = lang === 'en' ? '' : `${lang}/`;
  const pagePart =
    page === 'home' ? '' : page === 'case' ? `work/${slug}/` : page === 'method' ? `${METHOD_SLUG[lang]}/` : `${page}/`;
  return href(langPart + pagePart) + hash;
}

/** Link to a case: its own page when one exists, otherwise its card on /work. */
export function caseHref(lang: Lang, slug: string, hasPage: boolean): string {
  return hasPage ? pageHref(lang, 'case', '', slug) : pageHref(lang, 'work', `#${slug}`);
}

export function mailto(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
