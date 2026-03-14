import React from "react";
import "./VisionSection.css";

/* ══════════════════════════════════════════════════════════════════
   Geometry
   ──────────────────────────────────────────────────────────────────
   viewBox : 700 × 650
   Equilateral triangle, side d = 200, r = 133
   Centroid : (350, 350)
   dist centroid→circle-center = d/√3 ≈ 115.5

   Circle centers
     A (Aesthetics, top)         : (350, 234)
     L (Logic,      bottom-left) : (250, 408)
     E (Experience, bottom-right): (450, 408)

   Large-arrow circle
     Center : (350, 350)   R_arc = 285
     Gap angles (SVG CW from east):
       A-E gap → 330°    L-A gap → 210°    E-L gap → 90°
     Arrow endpoints: ±8° from each gap (104° arcs, sweep=1, large-arc=0)
       218°→(125,175)  322°→(575,175)   — Arrow 1
       338°→(614,243)  82°→(390,632)    — Arrow 2
        98°→(310,632) 202°→(86,243)     — Arrow 3
   ══════════════════════════════════════════════════════════════════ */

const R     = 133;   // circle radius  (SVG user units)
const AX=350, AY=234;   // Aesthetics centre
const LX=250, LY=408;   // Logic centre
const EX=450, EY=408;   // Experience centre

/* Text anchors — offset toward clock position:
     Aesthetics  → 12 o'clock (↑)
     Logic       → 8  o'clock (↙)   cos150=-0.866 sin150=0.5
     Experience  → 4  o'clock (↘)   cos30=0.866  sin30=0.5   */
const OFF = 38; // pixels from circle-centre toward clock direction
const CIRCLES = [
  {
    id: "aes",
    cx: AX, cy: AY,
    title: "AESTHETICS",
    kw1: "Form · Rhythm · Texture ·",
    kw2: "Visual Tone",
    // 12 o'clock = (0, -1)
    tx: AX,           ty: AY - OFF - 38,
    k1y: AY - OFF - 16, k2y: AY - OFF - 1,
  },
  {
    id: "log",
    cx: LX, cy: LY,
    title: "LOGIC",
    kw1: "System · Hierarchy ·",
    kw2: "Clarity · Function",
    // 8 o'clock = cos(150°)=-0.866  sin(150°)=0.5
    tx: LX + OFF * -0.866,  ty: LY + OFF * 0.5 - 20,
    k1y: LY + OFF * 0.5 + 2, k2y: LY + OFF * 0.5 + 17,
  },
  {
    id: "exp",
    cx: EX, cy: EY,
    title: "EXPERIENCE",
    kw1: "Narrative · Atmosphere ·",
    kw2: "Memory · Presence",
    // 4 o'clock = cos(30°)=0.866  sin(30°)=0.5
    tx: EX + OFF * 0.866,  ty: EY + OFF * 0.5 - 20,
    k1y: EY + OFF * 0.5 + 2, k2y: EY + OFF * 0.5 + 17,
  },
];

/* Three arcs of the single large circle  (CW, sweep=1, large-arc=0) */
const ARROWS = [
  "M 125 175 A 285 285 0 0 1 575 175",   // over top  (L-A gap → A-E gap)
  "M 614 243 A 285 285 0 0 1 390 632",   // lower-right  (A-E gap → E-L gap)
  "M 310 632 A 285 285 0 0 1 86 243",    // lower-left  (E-L gap → L-A gap)
];

function VennCircle({ cx, cy, id }) {
  return (
    <g>
      {/* Blurred outer glow blob */}
      <circle
        cx={cx} cy={cy} r={R + 55}
        fill={`url(#glow-${id})`}
        filter="url(#vs-blur)"
      />
      {/* Main sphere with smooth radial gradient */}
      <circle
        cx={cx} cy={cy} r={R}
        fill={`url(#fill-${id})`}
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="0.6"
        className="vs-circle-fill"
      />
    </g>
  );
}

export default function VisionSection() {
  return (
    <section className="vs-section">
      <div className="vs-inner">

        {/* ── Header ── */}
        <header className="vs-header">
          <h2 className="vs-title">
            <span>BETWEEN</span>
            <span>ART &amp; SYSTEM</span>
          </h2>
          <p className="vs-subtitle">Where aesthetics, logic and experience converge</p>
        </header>

        {/* ── Venn Diagram ── */}
        <div className="vs-diagram-wrap">
          <svg
            className="vs-svg"
            viewBox="0 0 700 650"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              {/* Soft blur filter for glow blobs */}
              <filter id="vs-blur" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="22" />
              </filter>

              {CIRCLES.map(({ id }) => (
                <React.Fragment key={id}>
                  {/* Extended outer glow gradient (used on r+55 circle) */}
                  <radialGradient
                    id={`glow-${id}`}
                    cx="50%" cy="50%" r="50%"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0%"   stopColor="#aaaaaa" stopOpacity="0.22" />
                    <stop offset="45%"  stopColor="#888888" stopOpacity="0.12" />
                    <stop offset="80%"  stopColor="#555555" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#111111" stopOpacity="0"    />
                  </radialGradient>

                  {/* Main sphere fill — lighter outer rim, darker interior */}
                  <radialGradient
                    id={`fill-${id}`}
                    cx="50%" cy="50%" r="52%"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0%"   stopColor="#1a1a1a" stopOpacity="0.55" />
                    <stop offset="40%"  stopColor="#303030" stopOpacity="0.38" />
                    <stop offset="72%"  stopColor="#606060" stopOpacity="0.26" />
                    <stop offset="90%"  stopColor="#909090" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#cccccc" stopOpacity="0.10" />
                  </radialGradient>
                </React.Fragment>
              ))}

              {/* Arrowhead */}
              <marker
                id="vs-arrow"
                markerWidth="8" markerHeight="6"
                refX="7" refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.40)" />
              </marker>
            </defs>

            {/* ── Circles ── */}
            {CIRCLES.map(({ id, cx, cy }) => (
              <VennCircle key={id} cx={cx} cy={cy} id={id} />
            ))}

            {/* ── Arrows (arcs of one large circle, CW) ── */}
            {ARROWS.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="rgba(255,255,255,0.30)"
                strokeWidth="1.2"
                markerEnd="url(#vs-arrow)"
              />
            ))}

            {/* ── Centre label ── */}
            <text x="350" y="344" textAnchor="middle" className="vs-svg-center">STRUCTURED</text>
            <text x="350" y="358" textAnchor="middle" className="vs-svg-center">EMOTION</text>

            {/* ── Circle labels ── */}
            {CIRCLES.map(({ id, title, kw1, kw2, tx, ty, k1y, k2y }) => (
              <g key={`lbl-${id}`}>
                <text x={tx} y={ty}  textAnchor="middle" fontSize="20" className="vs-svg-title">{title}</text>
                <text x={tx} y={k1y} textAnchor="middle" fontSize="13" className="vs-svg-kw">{kw1}</text>
                <text x={tx} y={k2y} textAnchor="middle" fontSize="13" className="vs-svg-kw">{kw2}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* ── Pillar descriptions ── */}
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
