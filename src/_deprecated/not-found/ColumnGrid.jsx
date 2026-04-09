import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useMouseNorm from './useMouseNorm';

/*
  21-column system.
  baseW = relative weight (not %). Normalized to 100% each frame.

  Each digit (4 / 0 / 4) gets:
    - 1 wide HERO column  → clearly readable
    - 4 ultra-thin slivers (1.5 weight) → show just a fragment
  Gap columns (weight 1.0) fall in inter-character white-space → appear blank.

  Mouse influence: columns near the cursor expand, the rest compress
  (Gaussian boost normalised over the whole set).
*/

const COLUMNS = [
  // ── Left edge — tail of run-1 / head of run-2 ────────────────────────
  { baseW: 2.5, ly:   0, px:  20, py:   6 },   //  0
  { baseW: 3.0, ly: -18, px: -14, py: -10 },   //  1

  // ── First "4" ─────────────────────────────────────────────────────────
  { baseW: 1.5, ly:  12, px:  22, py:   4 },   //  2  sliver
  { baseW: 1.5, ly: -38, px: -26, py: -12 },   //  3  sliver
  { baseW: 9.0, ly:   8, px:  10, py:   8 },   //  4  HERO
  { baseW: 1.5, ly: -28, px:  24, py:  -4 },   //  5  sliver
  { baseW: 1.5, ly:  20, px: -18, py:   9 },   //  6  sliver

  // ── Gap "4 ↔ 0" ───────────────────────────────────────────────────────
  { baseW: 1.0, ly: -15, px:  16, py:  -7 },   //  7  blank gap

  // ── "0" ───────────────────────────────────────────────────────────────
  { baseW: 1.5, ly:  32, px: -20, py:   3 },   //  8  sliver
  { baseW: 1.5, ly: -22, px:  28, py:  -9 },   //  9  sliver
  { baseW:11.0, ly:   6, px:  -8, py:   6 },   // 10  HERO
  { baseW: 1.5, ly: -42, px:  22, py:  -5 },   // 11  sliver
  { baseW: 1.5, ly:  14, px: -16, py:   9 },   // 12  sliver

  // ── Gap "0 ↔ 4" ───────────────────────────────────────────────────────
  { baseW: 1.0, ly:  -8, px:  14, py:   4 },   // 13  blank gap

  // ── Second "4" ────────────────────────────────────────────────────────
  { baseW: 1.5, ly:  28, px: -24, py:  -8 },   // 14  sliver
  { baseW: 1.5, ly: -16, px:  18, py:   5 },   // 15  sliver
  { baseW: 9.0, ly:  -4, px:  12, py:   7 },   // 16  HERO
  { baseW: 1.5, ly:  36, px: -22, py:  -6 },   // 17  sliver
  { baseW: 1.5, ly: -30, px:  26, py:   4 },   // 18  sliver

  // ── Right edge ────────────────────────────────────────────────────────
  { baseW: 3.0, ly:  10, px: -12, py:  -7 },   // 19
  { baseW: 2.5, ly: -20, px:  18, py:   5 },   // 20
];

const N          = COLUMNS.length;
const TOTAL_BW   = COLUMNS.reduce((s, c) => s + c.baseW, 0);
const INF_RADIUS = 0.30;
const BOOST      = 4.5;

// Resting column centres [0..1] — stable reference for influence calculation
const RESTING_CENTERS = (() => {
  let cum = 0;
  return COLUMNS.map(col => {
    const w = col.baseW / TOTAL_BW;
    const c = cum + w * 0.5;
    cum += w;
    return c;
  });
})();

export default function ColumnGrid() {
  const clipRefs  = useRef([]);
  const innerRefs = useRef([]);
  const filterRef = useRef(null);
  const turbRef   = useRef(null);   // cached to avoid getElementById in tick
  const mouse     = useMouseNorm();
  const rafRef    = useRef(null);

  useEffect(() => {
    turbRef.current = document.getElementById('nf2-turb');

    // Resting state before first paint
    let restLeft = 0;
    for (let i = 0; i < N; i++) {
      const w = (COLUMNS[i].baseW / TOTAL_BW) * 100;
      const clip  = clipRefs.current[i];
      const inner = innerRefs.current[i];
      if (!clip || !inner) continue;
      clip.style.width      = w + '%';
      clip.style.left       = restLeft + '%';
      inner.style.left      = `-${restLeft}vw`;
      inner.style.transform = `translateY(${COLUMNS[i].ly}px)`;
      restLeft += w;
    }

    // Pre-allocated typed arrays — no GC per frame
    const ew   = new Float32Array(N);
    const accL = new Float32Array(N);

    let seed         = 1;
    let lastSeedTime = performance.now();
    let dispScale    = 0;  // track current displacement scale to guard no-op writes

    const tick = (now) => {
      const { x: mx, y: my, vx, vy } = mouse.current;
      const mouseN = (mx + 1) * 0.5;

      // 1. Effective weights with Gaussian cursor boost
      let totalW = 0;
      for (let i = 0; i < N; i++) {
        const d   = Math.abs(mouseN - RESTING_CENTERS[i]);
        const inf = Math.max(0, 1 - (d / INF_RADIUS) ** 1.4);
        ew[i]     = COLUMNS[i].baseW * (1 + inf * BOOST);
        totalW   += ew[i];
      }

      // 2. Column widths + transforms
      let cumLeft = 0;
      for (let i = 0; i < N; i++) {
        const w  = (ew[i] / totalW) * 100;
        accL[i]  = cumLeft;
        cumLeft += w;

        const clip  = clipRefs.current[i];
        const inner = innerRefs.current[i];
        if (!clip || !inner) continue;

        clip.style.width      = w + '%';
        clip.style.left       = accL[i] + '%';
        inner.style.left      = `-${accL[i]}vw`;
        inner.style.transform = `translate(${mx * COLUMNS[i].px}px, ${COLUMNS[i].ly + my * COLUMNS[i].py}px)`;
      }

      // 3. SVG displacement — skip write when already at rest
      if (filterRef.current) {
        const speed     = Math.sqrt(vx * vx + vy * vy);
        const target    = Math.min(speed * 900, 28);
        const nextScale = dispScale + (target - dispScale) * 0.14;
        if (Math.abs(nextScale - dispScale) > 0.05) {
          dispScale = nextScale;
          filterRef.current.setAttribute('scale', dispScale);
        }
      }

      // 4. Ambient turbulence seed drift every ~2.2 s
      if (now - lastSeedTime > 2200) {
        seed = (seed % 999) + 1;
        turbRef.current?.setAttribute('seed', seed);
        lastSeedTime = now;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="nf2-scene">

      <svg className="nf2-svg-defs" aria-hidden={true}>
        <defs>
          <filter id="nf2-displace" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              id="nf2-turb"
              type="fractalNoise"
              baseFrequency="0.018 0.032"
              numOctaves="3"
              seed="1"
              result="noise"
            />
            <feDisplacementMap
              ref={filterRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {COLUMNS.map((_, i) => (
        <div
          key={i}
          className="nf2-col-clip"
          ref={el => (clipRefs.current[i] = el)}
        >
          <div
            className="nf2-col-inner"
            ref={el => (innerRefs.current[i] = el)}
          >
            <p className="nf2-label nf2-label--tl" aria-hidden={true}>
              YOU ARE<br />LOST?
            </p>

            <div className="nf2-digits-wrap" style={{ filter: 'url(#nf2-displace)' }}>
              <span className="nf2-run">404</span>
              <span className="nf2-run">404</span>
              <span className="nf2-run">404</span>
            </div>

            {/* Only the last (rightmost) column's link is keyboard-reachable;
                the sr-only Link below handles all other access methods. */}
            <Link to="/" className="nf2-label nf2-label--br" tabIndex={i === N - 1 ? 0 : -1}>
              BACK TO<br />HOME
            </Link>
          </div>
        </div>
      ))}

      <p className="nf2-sr-only">404 – Page not found.</p>
      <Link to="/" className="nf2-sr-only">Back to Home</Link>

    </div>
  );
}
