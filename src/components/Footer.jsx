import { Fragment, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Lottie from 'lottie-react';
import footerCircleAnimation from '../assets/icons/FooterCircle.json';
import { useTranslation } from '../hooks/useTranslation';
import './Footer.css';

/**
 * Zipped rows — nav item + contact item share the same grid row,
 * guaranteeing pixel-perfect horizontal alignment.
 */
const FOOTER_ROWS = [
  {
    nav: { key: 'nav.projects', to: '/projects' },
    contact: { type: 'link', href: 'mailto:hello@yidatsai.com', text: 'hello@yidatsai.com' },
  },
  {
    nav: { key: 'nav.playground', to: '/playground' },
    contact: { type: 'link', href: 'https://x.com/Yida_Tsai', text: 'x.com', external: true },
  },
  {
    nav: { key: 'nav.about', to: '/about' },
    contact: { type: 'link', href: 'https://www.behance.net/sth_of_yidatsai', text: 'Behance', external: true },
  },
  {
    nav: { key: 'nav.contact', to: '/contact' },
    contact: { type: 'copyright' },
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

/* ── Footer badge — Lottie, paused by default, plays on hover ─────── */

function FooterBadgeLottie() {
  const lottieRef = useRef(null);

  const handleEnter = () => lottieRef.current?.play();
  const handleLeave = () => lottieRef.current?.stop();

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={footerCircleAnimation}
      autoplay={false}
      loop={true}
      className="footer-badge"
      aria-hidden="true"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    />
  );
}

/* ── Footer ────────────────────────────────────────────────────────── */

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const { t, tf } = useTranslation();
  const { lang = 'en' } = useParams();
  const year = CURRENT_YEAR;

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Col 1 — YIDATSAI */}
        <Link to={`/${lang}/`} className="footer-logo clickable" aria-label="YIDA TSAI">
          <LineRoll>YI</LineRoll>
          <LineRoll>DA</LineRoll>
          <LineRoll>TSAI</LineRoll>
        </Link>

        {/* Cols 2–3 — aligned nav + contact grid */}
        <div className="footer-mid">
          {FOOTER_ROWS.map(({ nav, contact }) => (
            <Fragment key={nav.to}>
              <Link to={`/${lang}${nav.to}`} className="footer-nav-item clickable">
                <span className="footer-nav-bullet" aria-hidden="true" />
                <span className="footer-nav-label">
                  <RollingText>{t(nav.key)}</RollingText>
                </span>
              </Link>

              {contact.type === 'link' ? (
                <div className="footer-contact-row">
                  <a
                    href={contact.href}
                    className="footer-contact-link clickable"
                    {...(contact.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {contact.text}
                  </a>
                </div>
              ) : (
                <div className="footer-contact-row">
                  <p className="footer-copyright">{tf('footer.copyright', { year })}</p>
                </div>
              )}
            </Fragment>
          ))}
        </div>

        {/* Col 4 — badge */}
        <div className="footer-right">
          <FooterBadgeLottie />
        </div>

      </div>
    </footer>
  );
}
