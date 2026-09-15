import { useEffect, useRef, useState } from 'react';
import { useContent } from '../useContent.js';
import Corners from './Corners.jsx';
import Footer from './Footer.jsx';

const LINKEDIN = 'https://linkedin.com/in/andrewallacemf';
const MEDIUM = 'https://andrewallacemf.medium.com';

function mailto(email, subject) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

export default function Contact() {
  const { contact, cursor } = useContent();
  const section = useRef(null);
  const convo = useRef(null);
  const [copied, setCopied] = useState(false);

  // Bubbles + chips appear with a 400ms stagger the first time the section is
  // ≥50% visible. Without JS or with reduced motion they are simply visible.
  useEffect(() => {
    const el = section.current;
    const block = convo.current;
    if (!el || !block || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    block.classList.add('convo--pending');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.intersectionRatio >= 0.5)) {
          block.classList.remove('convo--pending');
          block.classList.add('convo--live');
          io.disconnect();
        }
      },
      { threshold: [0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
    } catch {
      window.prompt(contact.copy, contact.email);
    }
  }

  return (
    <section id="contact" ref={section} className="slide slide--contact slide--inverse" data-reveal aria-labelledby="contact-title">
      <div className="slide__box contact">
        <Corners />
        <div className="slide__inner contact__main">
          <p className="label contact__label">{contact.sectionLabel}</p>
          <h2 id="contact-title" className="contact__title">{contact.title}</h2>

          <div ref={convo} className="convo">
            <p className="bubble" style={{ '--i': 0 }}>{contact.bubble1}</p>
            <p className="bubble" style={{ '--i': 1 }}>{contact.bubble2}</p>
            <ul className="convo__chips" style={{ '--i': 2 }}>
              {contact.chips.map((chip) => (
                <li key={chip.label}>
                  <a className="chip chip--link" href={mailto(contact.email, chip.subject)} data-cursor={cursor.open}>
                    {chip.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="slide__inner contact__side">
          <ul className="contact__links">
            <li className="contact__row">
              <span className="label">{contact.emailLabel}</span>
              <span className="contact__value">
                <a href={`mailto:${contact.email}`} data-cursor={cursor.open}>{contact.email}</a>
                <button type="button" className="copy" onClick={copyEmail} data-cursor={cursor.copy} aria-live="polite">
                  {copied ? contact.copied : contact.copy}
                </button>
              </span>
            </li>
            <li className="contact__row">
              <span className="label">{contact.linkedinLabel}</span>
              <a href={LINKEDIN} target="_blank" rel="noopener" data-cursor={cursor.open}>
                {contact.linkedin} <span aria-hidden="true">↗</span>
              </a>
            </li>
            <li className="contact__row">
              <span className="label">{contact.resumeLabel}</span>
              <a href="#" data-cursor={cursor.open}>
                {contact.resumeLabel} <span aria-hidden="true">↓</span>
              </a>
            </li>
            <li className="contact__row">
              <span className="label">{contact.mediumLabel}</span>
              <a href={MEDIUM} target="_blank" rel="noopener" data-cursor={cursor.open}>
                {contact.medium} <span aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </div>

        <Footer />
      </div>
    </section>
  );
}
