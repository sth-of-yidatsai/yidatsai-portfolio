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
 * Each letter has a "top" (visible copy) and "bottom" (offset copy below clip).
 * Both translate upward together: top exits through clip top, bottom enters from below.
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

// Minimum text animation display time.
// PLAYGROUND = 10 chars → stagger = 9 × 38ms = 342ms → 1600 + 342 + 200 buffer
const CYCLE_MS = 2200;

/**
 * Global page loader.
 *
 * Flash prevention strategy:
 *   - Initial load: static HTML shield (index.html, z-index 10000) covers the page
 *     before JS loads; removed once this component mounts.
 *   - Route changes: LoaderProvider uses useLayoutEffect so setShow(true) fires
 *     before the browser paints, putting the loader and new page in the same frame.
 *     The !visible && !show guard ensures the overlay renders in that same pass
 *     even before the visible state is confirmed via useEffect.
 *
 * Exit: black overlay slides UP (translateY 0 → -100%) — curtain reveal.
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

  // Remove the static HTML shield once React has taken over
  useEffect(() => {
    const shield = document.getElementById("loader-shield");
    if (shield) shield.remove();
  }, []);

  useEffect(() => {
    if (show) {
      clearTimeout(timerRef.current);
      cycleReadyRef.current = false;
      exitPendingRef.current = false;
      setVisible(true);
      setExiting(false);
      timerRef.current = setTimeout(() => {
        cycleReadyRef.current = true;
        if (exitPendingRef.current) setExiting(true);
      }, CYCLE_MS);
    } else {
      if (cycleReadyRef.current) setExiting(true);
      else exitPendingRef.current = true;
    }
  }, [show]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleTransitionEnd = (e) => {
    if (e.target === containerRef.current && e.propertyName === "transform") {
      setVisible(false);
      setExiting(false);
      window.dispatchEvent(new CustomEvent("loader:exit-complete"));
    }
  };

  // Render even when visible=false if show just became true (useEffect is async;
  // the guard keeps the overlay in the DOM in the same render pass as show=true).
  if (!visible && !show) return null;

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
