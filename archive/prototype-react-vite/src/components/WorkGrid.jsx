import { useState } from 'react';
import { useContent } from '../useContent.js';
import { StatusPill } from './CaseSlide.jsx';
import Corners from './Corners.jsx';

function Card({ item, href }) {
  const { cursor, ui } = useContent();
  const [expanded, setExpanded] = useState(false);
  return (
    <li>
      <a
        id={item.slug}
        className="card"
        href={href}
        data-cursor={cursor.view}
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
      >
        <Corners />
        <p className="card__eyebrow">
          <StatusPill status={item.status} />
          <span className="label num">{item.year}</span>
        </p>
        <h2 className="card__title">{item.title}</h2>
        {/* Clamped to 4 lines at rest; tapping/clicking the card expands it (also via :target without JS). */}
        <p className="card__result">{item.result}</p>
        <p className="card__client label">{item.client}</p>
        <dl className="card__meta">
          <dt className="label">{ui.role}</dt>
          <dd>{item.role}</dd>
        </dl>
        <span className="card__arrow" aria-hidden="true">↗</span>
      </a>
    </li>
  );
}

export default function WorkGrid({ routes }) {
  const { work, cases } = useContent();
  return (
    <section className="work" aria-labelledby="work-title">
      <header className="work__head">
        <h1 id="work-title" className="work__title">{work.title}</h1>
        <p className="work__intro">{work.intro}</p>
      </header>
      <ul className="work__grid">
        {cases.items.map((item) => (
          <Card key={item.slug} item={item} href={routes.caseLink(item.slug)} />
        ))}
      </ul>
    </section>
  );
}
