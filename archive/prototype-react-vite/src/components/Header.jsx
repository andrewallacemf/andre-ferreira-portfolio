import { useEffect, useState } from 'react';
import { useContent } from '../useContent.js';
import ThemeToggle from './ThemeToggle.jsx';

export default function Header({ lang, page, routes }) {
  const { nav, hero, ui } = useContent();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on Escape and when the viewport grows to desktop.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const mq = window.matchMedia('(min-width: 1024px)');
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  const links = [
    { href: routes.work, label: nav.work, current: page === 'work' },
    { href: routes.anchor('about'), label: nav.about },
    { href: routes.anchor('contact'), label: nav.contact },
  ];

  return (
    <header className="header" data-open={open || undefined}>
      <a className="header__name" href={routes.home} aria-current={page === 'home' ? 'page' : undefined}>
        {hero.name}
      </a>

      <nav id="site-nav" className="header__nav">
        <ul className="header__links">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} aria-current={l.current ? 'page' : undefined} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header__tools">
        <a
          className="header__lang"
          href={routes.altHref}
          lang={routes.altLang}
          hrefLang={routes.altLang}
          title={nav.langSwitchTitle}
          aria-label={nav.langSwitchTitle}
        >
          {nav.langSwitch}
        </a>
        <ThemeToggle />
        <button
          type="button"
          className="header__menu"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {ui.menu}
        </button>
      </div>
    </header>
  );
}
