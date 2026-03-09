import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const NAV_LINKS = [
  { number: "01", label: "PROJECT", to: "/projects" },
  { number: "02", label: "PLAYGROUND", to: "/playground" },
  { number: "03", label: "ABOUT", to: "/about" },
  { number: "04", label: "CONTACT", to: "/contact" },
];

/** Line-level roll: the whole line slides up/down as a unit */
function LineRoll({ children }) {
  return (
    <span className="line-roll">
      <span className="line-roll-top">{children}</span>
      <span className="line-roll-bottom" aria-hidden="true">{children}</span>
    </span>
  );
}

/** Letter-level roll: each character slides independently */
function RollingText({ children }) {
  return (
    <span className="rolling-text" aria-label={children}>
      {[...children].map((char, i) =>
        char === " " ? (
          <span key={i} className="rolling-space">&nbsp;</span>
        ) : (
          <span key={i} className="rolling-letter" style={{ "--i": i }}>
            <span className="rolling-top">{char}</span>
            <span className="rolling-bottom" aria-hidden="true">{char}</span>
          </span>
        )
      )}
    </span>
  );
}

function detectBgTheme() {
  const points = [
    [window.innerWidth * 0.5, window.innerHeight * 0.35],
    [window.innerWidth * 0.25, window.innerHeight * 0.35],
    [window.innerWidth * 0.75, window.innerHeight * 0.35],
  ];

  let total = 0;
  let count = 0;

  for (const [x, y] of points) {
    let el = document.elementFromPoint(x, y);
    while (el && el !== document.documentElement) {
      const bg = window.getComputedStyle(el).backgroundColor;
      const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (m) {
        const alpha = m[4] !== undefined ? parseFloat(m[4]) : 1;
        if (alpha > 0.05) {
          total += (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
          count++;
          break;
        }
      }
      el = el.parentElement;
    }
  }

  if (count === 0) {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      const lum = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
      return lum < 0.5 ? "dark" : "light";
    }
    return "light";
  }

  return total / count < 0.5 ? "dark" : "light";
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [theme, setTheme] = useState("light");

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      const detected = detectBgTheme();
      setTheme(detected);
      setIsOpen(true);
      setHasOpened(true);
    }
  }, [isOpen]);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeMenu]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
    return () => document.body.classList.remove("menu-open");
  }, [isOpen]);

  const overlayClass = [
    "header-overlay",
    isOpen ? "open" : "",
    hasOpened ? "has-opened" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Full-screen overlay */}
      <div className={overlayClass} data-theme={theme} aria-hidden={!isOpen}>
        {/* Top 50vh — solid panel */}
        <div className="header-overlay-top">
          {/* YIDATSAI — clickable, navigates home */}
          <Link
            to="/"
            className="header-overlay-logo"
            aria-label="YIDA TSAI"
            onClick={closeMenu}
          >
            <LineRoll>YI</LineRoll>
            <LineRoll>DA</LineRoll>
            <LineRoll>TSAI</LineRoll>
          </Link>

          <nav className="header-overlay-nav" aria-label="Main navigation">
            {NAV_LINKS.map(({ number, label, to }) => (
              <Link
                key={to}
                to={to}
                className="header-nav-item clickable"
                onClick={closeMenu}
              >
                <span className="header-nav-number">({number})</span>
                <span className="header-nav-label">
                  <RollingText>{label}</RollingText>
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom 50vh — liquid glass */}
        <div className="header-overlay-glass" />
      </div>

      {/* Header bar — always visible, animates hamburger ↔ X */}
      <header className="header-bar">
        <Link
          to="/"
          className={[
            "header-bar-logo",
            "clickable",
            isOpen ? "logo-out" : "",
            hasOpened && !isOpen ? "logo-in" : "",
          ].filter(Boolean).join(" ")}
        >
          YIDA
        </Link>
        <button
          className="header-hamburger clickable"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <span className={`header-hamburger-line line1${isOpen ? " open" : ""}`} />
          <span className={`header-hamburger-line line2${isOpen ? " open" : ""}`} />
        </button>
      </header>
    </>
  );
}
