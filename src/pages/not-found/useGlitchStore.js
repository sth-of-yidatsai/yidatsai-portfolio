// Module-level singleton — shared between R3F canvas and DOM layer.
// Plain mutable object; no React re-renders triggered on write.
const store = {
  mouse:    { x: 0, y: 0 }, // NDC [-1, 1]
  phase:    0,               // 0 = broken/glitch  →  1 = clean
  linePing: 0,               // 0→1→0 pulse when compression completes
  invalidate: null,
};

export default store;
