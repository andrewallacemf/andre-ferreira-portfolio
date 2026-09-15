// Single entry point for copy. Both JSON files live in shared/content and are
// imported (not copied): editing them is the only way to change site text.
import en from '../../../shared/content/en.json';
import pt from '../../../shared/content/pt.json';

export type Lang = 'en' | 'pt';
export type Content = typeof en;
export type CaseItem = Content['cases']['items'][number];
export type StatusKey = keyof Content['cases']['statusLabels'];

const all: Record<Lang, Content> = { en, pt: pt as Content };

export function getContent(lang: Lang): Content {
  return all[lang];
}

export function otherLang(lang: Lang): Lang {
  return lang === 'en' ? 'pt' : 'en';
}

/** The three featured cases, in `cases.featured` order. */
export function featuredCases(t: Content): CaseItem[] {
  return t.cases.featured
    .map((slug) => t.cases.items.find((c) => c.slug === slug))
    .filter((c): c is CaseItem => Boolean(c));
}

export function statusLabel(t: Content, status: string): string {
  return t.cases.statusLabels[status as StatusKey] ?? status;
}

/** Small UI labels (definition-list labels and the mobile menu button). */
export function uiLabels(t: Content, _lang: Lang) {
  return {
    role: t.cases.roleLabel,
    scope: t.cases.scopeLabel,
    menu: t.nav.menu,
  };
}

/* ---- Long-form case pages -------------------------------------------- */
/* One JSON per case and language in shared/content/cases/<slug>.<lang>.json.
   A case only gets a page (/work/<slug>/) when its file exists for that language. */
const bodies = import.meta.glob<CaseBody>('../../../shared/content/cases/*.json', { eager: true, import: 'default' });

export interface CaseSection {
  id: string;
  label: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: { title: string; text: string }[];
  decisions?: { title: string; text: string }[];
  showFacts?: boolean;
  figure?: string;
  aspect?: string;
}
export interface CaseBody {
  slug: string;
  kicker: string;
  lede: string;
  hero?: { figure: string; aspect?: string };
  sections: CaseSection[];
  next?: string;
}

export function getCaseBody(lang: Lang, slug: string): CaseBody | undefined {
  const key = Object.keys(bodies).find((k) => k.endsWith(`/${slug}.${lang}.json`));
  return key ? bodies[key] : undefined;
}

export function hasCasePage(lang: Lang, slug: string): boolean {
  return Boolean(getCaseBody(lang, slug));
}

export function caseSlugsWithPage(lang: Lang): string[] {
  return Object.keys(bodies)
    .filter((k) => k.endsWith(`.${lang}.json`))
    .map((k) => k.split('/').pop()!.replace(`.${lang}.json`, ''));
}
