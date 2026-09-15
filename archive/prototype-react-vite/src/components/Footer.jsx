import { useContent } from '../useContent.js';

export default function Footer() {
  const { footer, cursor } = useContent();
  return (
    <footer className="footer">
      <p className="label footer__line">{footer.line}</p>
      <p className="label">
        <a href="https://github.com/" rel="noopener" target="_blank" data-cursor={cursor.open}>
          {footer.source} <span aria-hidden="true">↗</span>
        </a>
      </p>
    </footer>
  );
}
