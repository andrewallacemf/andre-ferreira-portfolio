import { useContent } from '../useContent.js';
import Corners from './Corners.jsx';

export function StatusPill({ status }) {
  const { cases } = useContent();
  return <span className="pill">{cases.statusLabels[status] || status}</span>;
}

/**
 * One featured case = one full-viewport slide on desktop.
 * Desktop: only the CTA is a link. Touch: an overlay link (CSS-only, shown
 * under @media (hover: none)) makes the whole card tappable, with a ↗ arrow.
 */
export default function CaseSlide({ item, index, href }) {
  const { cases, cursor, ui } = useContent();
  const roleLabel = index === 0 ? cases.sectionLabel : null;
  const titleId = `case-${item.slug}-title`;

  return (
    <section className="slide slide--case" data-reveal aria-labelledby={titleId}>
      <div className="slide__box case">
        <Corners />
        <a className="case__overlay" href={href} aria-hidden="true" tabIndex={-1}>
          <span className="case__arrow" aria-hidden="true">↗</span>
        </a>

        <div className="slide__inner case__text">
          {roleLabel && <p className="label case__section">{roleLabel}</p>}
          <p className="case__eyebrow">
            <StatusPill status={item.status} />
            <span className="label num">{item.year}</span>
          </p>
          <h2 id={titleId} className="case__title">{item.title}</h2>
          <p className="case__result">{item.result}</p>

          <dl className="case__meta">
            <div>
              <dt className="label">{ui.role}</dt>
              <dd>{item.role}</dd>
            </div>
            <div>
              <dt className="label">{ui.scope}</dt>
              <dd>{item.scope}</dd>
            </div>
          </dl>

          <ul className="facts" aria-label={item.title}>
            {item.facts.map(([n, caption]) => (
              <li key={caption} className="fact">
                <span className="fact__num num">{n}</span>
                <span className="fact__caption">{caption}</span>
              </li>
            ))}
          </ul>

          <p className="case__cta-row">
            <a className="cta" href={href} data-cursor={cursor.view}>
              {cases.cta} <span aria-hidden="true">→</span>
            </a>
          </p>
        </div>

        <div className="slide__inner case__visual" aria-hidden="true">
          <div className="panel">
            <Corners />
            <ul className="panel__nums">
              {item.facts.map(([n, caption]) => (
                <li key={caption}>
                  <span className="panel__num num">{n}</span>
                  <span className="panel__caption">{caption}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
