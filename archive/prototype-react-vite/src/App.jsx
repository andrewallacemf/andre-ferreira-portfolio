import { useEffect } from 'react';
import { ContentProvider, routes } from './useContent.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import CaseSlide from './components/CaseSlide.jsx';
import Principles from './components/Principles.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import WorkGrid from './components/WorkGrid.jsx';
import DotGrid from './components/DotGrid.jsx';
import Cursor from './components/Cursor.jsx';
import gaps from './content-gaps.json';

/**
 * Slide contents fade/translate in when a slide enters. Resting state (no JS,
 * reduced motion) is fully visible: the hiding class is only ever added by JS,
 * and only to slides that are off-screen at hydration time.
 */
function useReveal(page) {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const slides = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.remove('is-out');
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          } else if (!e.target.classList.contains('is-in')) {
            e.target.classList.add('is-out');
          }
        }
      },
      { threshold: 0.15 },
    );
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [page]);
}

export default function App({ lang, page, content }) {
  const r = routes(lang, page);
  useReveal(page);
  const featured = content.cases.featured
    .map((slug) => content.cases.items.find((c) => c.slug === slug))
    .filter(Boolean);

  return (
    <ContentProvider value={{ ...content, ui: gaps[lang] || gaps.en }}>
      <a className="skip" href="#main">{content.nav.skip}</a>
      <DotGrid />
      <Header lang={lang} page={page} routes={r} />
      {page === 'home' ? (
        <main id="main" className="main main--snap" tabIndex={-1}>
          <Hero />
          {featured.map((c, i) => (
            <CaseSlide key={c.slug} item={c} index={i} href={r.caseLink(c.slug)} />
          ))}
          <Principles />
          <About />
          <Contact />
        </main>
      ) : (
        <main id="main" className="main main--flow" tabIndex={-1}>
          <WorkGrid routes={r} />
        </main>
      )}
      <Cursor />
    </ContentProvider>
  );
}
