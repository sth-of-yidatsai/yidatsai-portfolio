import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "./assets/loader.module.scss";

const ROUTE_LABELS = {
  "/": "HOME",
  "/about": "ABOUT",
  "/contact": "CONTACT",
  "/playground": "PLAYGROUND",
};

function getPageLabel(pathname) {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  if (pathname.startsWith("/projects")) return "PROJECTS";
  return "YIDA";
}

/**
 * Per-letter rolling text — mirrors footer nav hover animation style but loops.
 * Each letter has a "top" (the visible copy) and "bottom" (offset copy below clip).
 * Both translate upward together: top exits through clip top, bottom enters through clip bottom.
 */
function RollingText({ text }) {
  return (
    <span className={styles["rolling-text"]} aria-label={text}>
      {[...text].map((char, i) => (
        <span
          key={i}
          className={styles["rolling-letter"]}
          style={{ "--i": i }}
        >
          <span className={styles["rolling-top"]}>{char}</span>
          <span className={styles["rolling-bottom"]} aria-hidden="true">
            {char}
          </span>
        </span>
      ))}
    </span>
  );
}

// Minimum cycle time: animation duration (1.6s) + max stagger for longest word
// PLAYGROUND = 10 chars → delay = 9 × 38ms = 342ms → total = 1600 + 342 + 200 buffer ≈ 2200ms
const CYCLE_MS = 2200;

/**
 * Global page loader.
 * - Black overlay, white per-letter rolling text matching the page being loaded.
 * - Guarantees at least one full animation cycle before exit.
 * - Exits with a curtain-up (translateY 0 → -100%) reveal.
 */
export function Loader({ show }) {
  const { pathname } = useLocation();
  const label = getPageLabel(pathname);

  const [visible, setVisible] = useState(show);
  const [exiting, setExiting] = useState(false);

  const cycleReadyRef = useRef(false);
  const exitPendingRef = useRef(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (show) {
      // New load — reset and start animation cycle timer
      setVisible(true);
      setExiting(false);
      cycleReadyRef.current = false;
      exitPendingRef.current = false;
      timerRef.current = setTimeout(() => {
        cycleReadyRef.current = true;
        if (exitPendingRef.current) {
          setExiting(true);
        }
      }, CYCLE_MS);
    } else {
      // Page is ready — trigger exit when cycle has completed
      if (cycleReadyRef.current) {
        setExiting(true);
      } else {
        exitPendingRef.current = true;
      }
    }
  }, [show]);

  // Clear pending timer on unmount only
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleTransitionEnd = (e) => {
    // Only respond to the curtain translateY transition on the root element
    if (e.target === containerRef.current && e.propertyName === "transform") {
      setVisible(false);
      setExiting(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className={`${styles.loader} ${exiting ? styles["loader--exit"] : ""}`}
      onTransitionEnd={handleTransitionEnd}
    >
      <RollingText text={label} />
    </div>
  );
}

export default Loader;
