import { useContent } from '../useContent.js';
import Corners from './Corners.jsx';

export default function Principles() {
  const { principles } = useContent();
  return (
    <section className="slide slide--principles" data-reveal aria-labelledby="principles-title">
      <div className="slide__box principles">
        <Corners />
        <div className="slide__inner principles__inner">
          <h2 id="principles-title" className="label principles__label">{principles.sectionLabel}</h2>
          <ul className="principles__list">
            {principles.items.map((q) => (
              <li key={q} className="principles__item">
                <blockquote className="principles__quote">{q}</blockquote>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
