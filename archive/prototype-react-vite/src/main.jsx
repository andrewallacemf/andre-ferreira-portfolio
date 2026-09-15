import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import App from './App.jsx';
import { loadContent } from './useContent.js';
import './styles.css';

const root = document.getElementById('root');
const lang = root.dataset.lang === 'pt' ? 'pt' : 'en';
const page = root.dataset.page === 'work' ? 'work' : 'home';

loadContent(lang).then((content) => {
  const app = (
    <StrictMode>
      <App lang={lang} page={page} content={content} />
    </StrictMode>
  );
  // Pre-rendered at build time (scripts/prerender.mjs) → hydrate. Dev server → client render.
  if (root.hasChildNodes()) hydrateRoot(root, app);
  else createRoot(root).render(app);
});
