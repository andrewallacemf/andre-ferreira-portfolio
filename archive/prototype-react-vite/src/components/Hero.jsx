import { useContent } from '../useContent.js';
import Corners from './Corners.jsx';

export default function Hero() {
  const { hero, meta } = useContent();
  return (
    <section className="slide slide--hero" data-reveal aria-labelledby="hero-title">
      <div className="slide__box hero">
        <Corners />
        <div className="slide__inner hero__inner">
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">{hero.line1}</span>
            <span className="hero__line">{hero.line2}</span>
            <span className="hero__line">{hero.line3}</span>
          </h1>
          <p className="hero__sub">{hero.sub}</p>
          <p className="hero__now live">
            <span className="live__dot" aria-hidden="true" />
            {hero.now}
          </p>
          <p className="hero__status">
            <span className="pill">{hero.status}</span>
          </p>
        </div>

        <p className="hero__corner hero__corner--left label">{meta.location}</p>
        <p className="hero__corner hero__corner--right label num">©{meta.year}</p>
        <p className="hero__scroll label" aria-hidden="true">
          <span>{hero.scroll}</span>
          <span className="hero__scroll-line" />
        </p>
      </div>
    </section>
  );
}
