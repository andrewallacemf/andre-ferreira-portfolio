import { useEffect, useState } from 'react';
import { useContent } from '../useContent.js';

const KEY = 'theme';

function readTheme() {
  const stamped = document.documentElement.getAttribute('data-theme');
  return stamped === 'light' ? 'light' : 'dark';
}

/**
 * Default dark. The inline <script> in <head> stamps data-theme before first
 * paint; this button only flips it and persists the choice. aria-pressed
 * reflects "light mode on".
 */
export default function ThemeToggle() {
  const { nav } = useContent();
  const [theme, setTheme] = useState('dark'); // server value; corrected after hydration

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode / blocked storage: theme still applies for this page */
    }
    setTheme(next);
  }

  const isLight = theme === 'light';
  return (
    <button
      type="button"
      className="theme"
      onClick={toggle}
      aria-pressed={isLight}
      aria-label={`${nav.theme}: ${isLight ? nav.themeLight : nav.themeDark}`}
      title={nav.theme}
    >
      <span className="theme__dot" aria-hidden="true" />
      <span className="theme__label">{isLight ? nav.themeLight : nav.themeDark}</span>
    </button>
  );
}
