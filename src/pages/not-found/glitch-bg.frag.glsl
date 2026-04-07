// Procedural glitch background.
// Large-amplitude multi-frequency sine wave UV warping applied to a dense block grid.
// ALL visual shape comes from the distortion — no blob masks, no static regions.
// uIntensity: 1.0 = full chaos wave,  0.0 = flat dark background.

varying vec2 vUv;
uniform float uIntensity;
uniform float uTime;
uniform vec2  uMouse;
uniform float uAspect;

// ── Utilities ───────────────────────────────────────────────────────────────
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 neonColor(float seed) {
  float t = fract(seed * 8.0);
  if (t < 0.125) return vec3(1.0,  0.0,  1.0);  // magenta
  if (t < 0.25)  return vec3(0.0,  1.0,  1.0);  // cyan
  if (t < 0.375) return vec3(1.0,  1.0,  0.0);  // yellow
  if (t < 0.5)   return vec3(0.0,  1.0,  0.0);  // green
  if (t < 0.625) return vec3(1.0,  0.0,  0.0);  // red
  if (t < 0.75)  return vec3(1.0,  1.0,  1.0);  // white
  if (t < 0.875) return vec3(0.15, 0.35, 1.0);  // blue
  return vec3(1.0, 0.55, 0.0);                   // orange
}

// ── Main ────────────────────────────────────────────────────────────────────
void main() {
  vec2 uv = vUv;

  // ── Mouse ripple ──────────────────────────────────────────────────────────
  vec2  mUV     = uMouse * 0.5 + 0.5;
  vec2  toMouse = uv - mUV;
  toMouse.x    *= uAspect;
  float mDist   = length(toMouse);
  float ripple  = sin(mDist * 30.0 - uTime * 7.0)
                  * smoothstep(0.40, 0.0, mDist)
                  * 0.016
                  * uIntensity;
  if (mDist > 0.001) uv += (toMouse / mDist) * ripple;

  // ── Multi-frequency sine wave warping ─────────────────────────────────────
  // Primary low-frequency waves produce the large S-curves seen in the reference.
  // Higher harmonics layer in detail and interference patterns.
  // Amplitude is scaled by uIntensity so the world heals to a flat grid on scroll.
  float t = uTime * 0.20;

  float wx = 0.0;
  wx += sin(uv.y *  5.03  + t)             * 0.165;   // dominant wave — big sweeps
  wx += sin(uv.y * 12.71  - t * 0.61)      * 0.068;   // second harmonic
  wx += sin(uv.y * 27.9   + t * 1.15)      * 0.026;   // medium detail
  wx += sin(uv.y * 57.4   - t * 1.87)      * 0.010;   // fine jitter
  wx *= uIntensity;

  float wy = 0.0;
  wy += sin(uv.x *  6.17  + t * 0.78)      * 0.048;   // vertical sway
  wy += sin(uv.x * 16.8   - t * 0.42)      * 0.019;
  wy *= uIntensity;

  vec2 wUv = uv + vec2(wx, wy);

  // Wrap x so bands that slide past the edge reappear (continuous signal loop)
  wUv.x = fract(wUv.x + 2.0);
  wUv.y = clamp(wUv.y, 0.001, 0.999);

  // ── Block grid on the warped UV ───────────────────────────────────────────
  // Horizontal bands dominate (tall-ish blocks = pixel scanline aesthetic)
  float tf  = floor(uTime * 10.0);          // 10 fps identity snap (smooth feel)

  float bh     = 0.006 + hash(vec2(floor(wUv.y / 0.008), tf * 0.4)) * 0.016;
  float bandId = floor(wUv.y / bh);
  float bw     = 0.003 + hash(vec2(bandId * 4.3, tf * 0.3)) * 0.022;

  vec2  blockCell  = floor(wUv / vec2(bw, bh));
  vec2  blockLocal = fract(wUv / vec2(bw, bh));

  float rColor   = hash(blockCell + vec2(tf * 0.08, 0.0));
  float rVisible = hash(blockCell + vec2(0.0,       tf * 0.10));
  float rType    = hash(blockCell + vec2(tf * 0.07, tf * 0.06) + 3.7);

  // Thin gap between blocks (the wave shapes create all the visual structure)
  float gap = 0.18 - uIntensity * 0.10;
  if (rVisible < gap) {
    gl_FragColor = vec4(0.039, 0.039, 0.039, 1.0);
    return;
  }

  vec3 col = neonColor(rColor);

  // ~25 % checkerboard
  if (rType > 0.75) {
    float cScale = 2.0 + hash(blockCell + 9.1) * 5.0;
    vec2  cCell  = floor(blockLocal * cScale);
    col = mod(cCell.x + cCell.y, 2.0) > 0.5 ? col : vec3(0.0);
  }
  // ~8 % white artifact
  else if (rType > 0.92) {
    col = vec3(1.0);
  }

  gl_FragColor = vec4(col, 1.0);
}
