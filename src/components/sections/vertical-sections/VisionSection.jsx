import { useState, useCallback, useRef } from "react";
import "./VisionSection.css";
import visionCircle from "../../../assets/icons/vision-circle.svg";

/* ══════════════════════════════════════════════════════════════════
   Geometry  —  viewBox 700 × 650
   Centroid (350,350)  R=155

   Circle centres
     A (350,234)=270°   L (250,408)=150°   E (450,408)=30°

   Arrows — three 90° arcs on ONE circle (350,350) R_arc=305, CW
     Gap midpoints: A-E=330°  E-L=90°  L-A=210°
     Each arc spans gap ± 12° (96° arc, sweep=1, large-arc=0)
       Arrow 1  222°→318°   (123,146)→(577,146)   over A
       Arrow 2  342°→ 78°   (640,256)→(413,648)   past E
       Arrow 3  102°→198°   (287,648)→( 60,256)   past L
   ══════════════════════════════════════════════════════════════════ */

const R   = 155;
const AX  = 350, AY = 234;
const LX  = 250, LY = 408;
const EX  = 450, EY = 408;
const OFF = 44;

const CIRCLES = [
  {
    id: "aes", cx: AX, cy: AY,
    rotation: 0,
    title: "AESTHETICS",
    kw1: "Form · Rhythm · Texture ·", kw2: "Visual Tone",
    tx: AX,   ty: 172,  k1y: 196, k2y: 212,
  },
  {
    id: "log", cx: LX, cy: LY,
    rotation: 240,
    title: "LOGIC",
    kw1: "System · Hierarchy ·", kw2: "Clarity · Function",
    tx: LX + OFF * -0.866,  ty: LY + OFF * 0.5 - 18,
    k1y: LY + OFF * 0.5 + 6, k2y: LY + OFF * 0.5 + 22,
  },
  {
    id: "exp", cx: EX, cy: EY,
    rotation: 120,
    title: "EXPERIENCE",
    kw1: "Narrative · Atmosphere ·", kw2: "Memory · Presence",
    tx: EX + OFF * 0.866,   ty: EY + OFF * 0.5 - 18,
    k1y: EY + OFF * 0.5 + 6, k2y: EY + OFF * 0.5 + 22,
  },
];

/* R_arc=305 — each arc is 96° CW, clearly outside all three spheres */
const ARROWS = [
  "M 123 146 A 305 305 0 0 1 577 146",   // L-A gap → A-E gap  (over top of A)
  "M 640 256 A 305 305 0 0 1 413 648",   // A-E gap → E-L gap  (right, past E)
  "M 287 648 A 305 305 0 0 1  60 256",   // E-L gap → L-A gap  (bottom-left, past L)
];

/* Arrowhead endpoint positions + rotation angles (tangent of CW arc at each end) */
const ARROW_ENDS = [
  { x: 577, y: 146, angle:  48 },  // end of arrow 1 (318° on arc)
  { x: 413, y: 648, angle: 168 },  // end of arrow 2 (78° on arc)
  { x:  60, y: 256, angle: 288 },  // end of arrow 3 (198° on arc)
];

const ANIM_DURATION = 900; // ms — must match CSS animation duration

function VennCircle({ cx, cy, id, rotation, title, kw1, kw2, tx, ty, k1y, k2y }) {
  const [phase, setPhase] = useState("idle");
  const timerRef = useRef(null);

  const handleEnter = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("hovering");
  }, []);

  const handleLeave = useCallback(() => {
    setPhase("leaving");
    timerRef.current = setTimeout(() => setPhase("idle"), ANIM_DURATION);
  }, []);

  const rotStyle = rotation
    ? { transform: `rotate(${rotation}deg)`, transformBox: "fill-box", transformOrigin: "center" }
    : undefined;

  return (
    /* Outer group — handles hover phase animations (circle + text move together) */
    <g
      className={`vs-ball vs-ball-${id} vs-phase-${phase}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Inner shape group — idle drift applies here only (text excluded) */}
      <g className={`vs-shape vs-shape-${id}`}>

        {/* Layer 1 · Atmospheric halo */}
        <circle cx={cx} cy={cy} r={R + 90}
          fill="url(#glow-atm)"
          filter="url(#vs-f-atm)"
          pointerEvents="none"
        />

        {/* Layer 2 · vision-circle.svg */}
        <image
          href={visionCircle}
          x={cx - R} y={cy - R}
          width={R * 2} height={R * 2}
          style={rotStyle}
          className="vs-circle-fill"
        />

      </g>

      {/* Labels — in outer group: move with hover but NOT with idle drift */}
      <text x={tx} y={ty}  textAnchor="middle" className="vs-svg-title">{title}</text>
      <text x={tx} y={k1y} textAnchor="middle" className="vs-svg-kw">{kw1}</text>
      <text x={tx} y={k2y} textAnchor="middle" className="vs-svg-kw">{kw2}</text>
    </g>
  );
}

export default function VisionSection() {
  return (
    <section className="vs-section">
      <div className="vs-inner">

        <header className="vs-header">
          <h2 className="vs-title">
            <span>BETWEEN</span>
            <span>ART <span className="vs-title-sub">&amp; SYSTEM</span></span>
          </h2>
          <p className="vs-subtitle">Where aesthetics, logic and experience converge</p>
        </header>

        <div className="vs-diagram-wrap">
          <svg
            className="vs-svg"
            viewBox="0 0 700 650"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>

              <filter id="vs-f-atm" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="42" />
              </filter>

              <radialGradient id="glow-atm" cx="50%" cy="50%" r="50%"
                gradientUnits="objectBoundingBox">
                <stop offset="0%"   stopColor="#cccccc" stopOpacity="0.28" />
                <stop offset="28%"  stopColor="#888888" stopOpacity="0.12" />
                <stop offset="62%"  stopColor="#444444" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0"    />
              </radialGradient>

            </defs>

            {/* Circles — rendered first (back layer) */}
            {CIRCLES.map(({ id, cx, cy, rotation, title, kw1, kw2, tx, ty, k1y, k2y }) => (
              <VennCircle key={id}
                cx={cx} cy={cy} id={id} rotation={rotation}
                title={title} kw1={kw1} kw2={kw2}
                tx={tx} ty={ty} k1y={k1y} k2y={k2y}
              />
            ))}

            {/* Arrows — trim-path animation, staggered */}
            {ARROWS.map((d, i) => (
              <path key={i} d={d}
                fill="none"
                stroke="rgba(255,255,255,0.38)"
                strokeWidth="1.2"
                className="vs-arrow"
                style={{ animationDelay: `${i * 2}s` }}
              />
            ))}

            {/* Arrowheads — appear only when trim-path stroke reaches endpoint */}
            {ARROW_ENDS.map(({ x, y, angle }, i) => (
              <polygon key={i}
                points="0 0, 7 2.5, 0 5"
                fill="rgba(255,255,255,0.35)"
                transform={`translate(${x}, ${y}) rotate(${angle}) translate(-6, -2.5)`}
                className="vs-arrowhead"
                style={{ '--arrowhead-delay': `${i * 2}s` }}
              />
            ))}

            {/* Centre label */}
            <text x="350" y="346" textAnchor="middle" className="vs-svg-center">STRUCTURED</text>
            <text x="350" y="360" textAnchor="middle" className="vs-svg-center">EMOTION</text>

          </svg>
        </div>

        <div className="vs-pillars">
          <div className="vs-pillar">
            <h3 className="vs-pillar-title">LOGIC</h3>
            <p className="vs-pillar-text">
              Structure organizes complexity. Systems, hierarchy and clarity transform ideas into understandable experiences.
            </p>
          </div>
          <div className="vs-pillar">
            <h3 className="vs-pillar-title">AESTHETICS</h3>
            <p className="vs-pillar-text">
              Visual language shapes perception. Form, rhythm and tone create an intuitive layer that communicates beyond words.
            </p>
          </div>
          <div className="vs-pillar">
            <h3 className="vs-pillar-title">EXPERIENCE</h3>
            <p className="vs-pillar-text">
              Design becomes meaningful through experience — atmosphere, memory and narrative that resonate with people.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
