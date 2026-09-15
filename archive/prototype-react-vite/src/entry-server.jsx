import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { loadContent } from './useContent.js';

/** Used by scripts/prerender.mjs to turn each built HTML into a static page. */
export async function render(lang, page) {
  const content = await loadContent(lang);
  return renderToString(<App lang={lang} page={page} content={content} />);
}
