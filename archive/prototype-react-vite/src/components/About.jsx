import { useContent } from '../useContent.js';
import Corners from './Corners.jsx';

export default function About() {
  const { about, timeline } = useContent();
  return (
    <section id="about" className="slide slide--about" data-reveal aria-labelledby="about-title">
      <div className="slide__box about">
        <Corners />
        <div className="slide__inner about__text">
          <h2 id="about-title" className="label about__label">{about.sectionLabel}</h2>
          <p className="about__p">{about.p1}</p>
          <p className="about__p">{about.p2}</p>
          <p className="about__p about__p--last">{about.p3}</p>
        </div>

        <div className="slide__inner about__path">
          <h3 className="label about__label">{timeline.sectionLabel}</h3>
          <ol className="eras">
            {timeline.eras.map((era) => (
              <li key={era.name} className="era">
                <div className="era__head">
                  <span className="era__name">{era.name}</span>
                  <span className="era__years label num">{era.years}</span>
                </div>
                <p className="era__text">{era.text}</p>
              </li>
            ))}
          </ol>

          <h3 className="label about__label about__clients-label">{timeline.clientsLabel}</h3>
          <ul className="chips" aria-label={timeline.clientsLabel}>
            {timeline.clients.map((c) => (
              <li key={c} className="chip">{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
