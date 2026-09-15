import { createContext, useContext } from 'react';

/**
 * All copy lives in shared/content/{en,pt}.json. The page loads only its own
 * language (dynamic import → separate chunk) and hands it to <App content=…>.
 * Components read it through useContent(); no string is ever hard-coded.
 */
export function loadContent(lang) {
  return lang === 'pt'
    ? import('../../../shared/content/pt.json').then((m) => m.default)
    : import('../../../shared/content/en.json').then((m) => m.default);
}

const ContentContext = createContext(null);
export const ContentProvider = ContentContext.Provider;

export function useContent() {
  const c = useContext(ContentContext);
  if (!c) throw new Error('useContent() must be used inside <ContentProvider>');
  return c;
}

/**
 * Relative links between the four static pages, computed from the current
 * page's depth so the build works from any sub-path (GitHub Pages, preview host).
 *   /            en home   depth 0
 *   /work/       en work   depth 1
 *   /pt/         pt home   depth 1
 *   /pt/work/    pt work   depth 2
 */
export function routes(lang, page) {
  const depth = (lang === 'pt' ? 1 : 0) + (page === 'work' ? 1 : 0);
  const up = depth === 0 ? './' : '../'.repeat(depth);
  const home = (l) => up + (l === 'pt' ? 'pt/' : '');
  const work = (l) => up + (l === 'pt' ? 'pt/work/' : 'work/');
  const other = lang === 'pt' ? 'en' : 'pt';
  return {
    home: home(lang),
    work: work(lang),
    anchor: (id) => (page === 'home' ? `#${id}` : `${home(lang)}#${id}`),
    caseLink: (slug) => (page === 'work' ? `#${slug}` : `${work(lang)}#${slug}`),
    altLang: other,
    altHref: page === 'work' ? work(other) : home(other),
  };
}
