import { Fragment, useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import footerCircle from '../assets/icons/footer_circle.svg';
import './Footer.css';

/**
 * Zipped rows — nav item + contact item share the same grid row,
 * guaranteeing pixel-perfect horizontal alignment.
 */
const FOOTER_ROWS = [
  {
    nav: { label: 'PROJECT', to: '/projects' },
    contact: { type: 'link', href: 'mailto:hello@yidatsai.com', text: 'hello@yidatsai.com' },
  },
  {
    nav: { label: 'PLAYGROUND', to: '/playground' },
    contact: { type: 'link', href: 'https://x.com/Yida_Tsai', text: 'x.com', external: true },
  },
  {
    nav: { label: 'ABOUT', to: '/about' },
    contact: { type: 'link', href: 'https://www.behance.net/sth_of_yidatsai', text: 'Behance', external: true },
  },
  {
    nav: { label: 'CONTACT', to: '/contact' },
    contact: { type: 'toggle' },
  },
];

/* ── Animation helpers (same as Header) ──────────────────────────── */

function LineRoll({ children }) {
  return (
    <span className="footer-line-roll">
      <span className="footer-line-roll-top">{children}</span>
      <span className="footer-line-roll-bottom" aria-hidden="true">{children}</span>
    </span>
  );
}

function RollingText({ children }) {
  return (
    <span className="footer-rolling-text" aria-label={children}>
      {[...children].map((char, i) =>
        char === ' ' ? (
          <span key={i} className="footer-rolling-space">&nbsp;</span>
        ) : (
          <span key={i} className="footer-rolling-letter" style={{ '--i': i }}>
            <span className="footer-rolling-top">{char}</span>
            <span className="footer-rolling-bottom" aria-hidden="true">{char}</span>
          </span>
        )
      )}
    </span>
  );
}

/* ── Language toggle with sliding white pill ─────────────────────── */

function LanguageToggle({ language, setLanguage }) {
  return (
    <div className="footer-lang-toggle" role="group" aria-label="Language">
      <span
        className="footer-lang-indicator"
        style={{ transform: language === 'zh' ? 'translateX(100%)' : 'translateX(0)' }}
        aria-hidden="true"
      />
      <button
        className={`footer-lang-btn clickable${language === 'en' ? ' active' : ''}`}
        onClick={() => setLanguage('en')}
      >
        English
      </button>
      <button
        className={`footer-lang-btn clickable${language === 'zh' ? ' active' : ''}`}
        onClick={() => setLanguage('zh')}
      >
        中文
      </button>
    </div>
  );
}

/* ── Footer ────────────────────────────────────────────────────────── */

export default function Footer() {
  const { language, setLanguage } = useContext(LanguageContext);
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Col 1 — YIDATSAI */}
        <Link to="/" className="footer-logo clickable" aria-label="YIDA TSAI">
          <LineRoll>YI</LineRoll>
          <LineRoll>DA</LineRoll>
          <LineRoll>TSAI</LineRoll>
        </Link>

        {/* Cols 2–3 — aligned nav + contact grid */}
        <div className="footer-mid">
          {FOOTER_ROWS.map(({ nav, contact }) => (
            <Fragment key={nav.to}>
              <Link to={nav.to} className="footer-nav-item clickable">
                <span className="footer-nav-bullet" aria-hidden="true" />
                <span className="footer-nav-label">
                  <RollingText>{nav.label}</RollingText>
                </span>
              </Link>

              {contact.type === 'link' ? (
                <a
                  href={contact.href}
                  className="footer-contact-link clickable"
                  {...(contact.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {contact.text}
                </a>
              ) : (
                <LanguageToggle language={language} setLanguage={setLanguage} />
              )}
            </Fragment>
          ))}
        </div>

        {/* Col 4 — badge + copyright */}
        <div className="footer-right">
          <img src={footerCircle} className="footer-badge-svg" alt="" aria-hidden="true" />
          <div className="footer-copyright-wrap">
            <p className="footer-copyright">Yida Tsai © 2020–{year}</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
