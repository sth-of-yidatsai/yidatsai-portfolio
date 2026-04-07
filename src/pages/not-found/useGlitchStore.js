// Module-level singleton — shared between R3F canvas and DOM layer.
// Plain mutable object; no React re-renders triggered on write.
const store = {
  mouse: { x: 0, y: 0 }, // NDC [-1, 1]
  phase: 0,               // 0 = broken/glitch  →  1 = clean
  invalidate: null,       // set by GlitchScene so external code can request a frame
};

export default store;
