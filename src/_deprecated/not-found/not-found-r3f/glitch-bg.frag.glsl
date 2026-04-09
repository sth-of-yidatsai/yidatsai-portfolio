// Procedural glitch background.
// Multi-frequency sine wave UV warping.
// uCompress: 0 = full screen, 1 = collapsed to a thin horizontal line at center.

varying vec2 vUv;
uniform float uIntensity;
uniform float uCompress;
uniform float uLinePing; // 0→1→0 completion flash
uniform float uTime;
uniform vec2  uMouse;
uniform float uAspect;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 grayColor(float seed) {
  float t = fract(seed * 8.0);
  if (t < 0.125) return vec3(0.90);
  if (t < 0.25)  return vec3(0.70);
  if (t < 0.375) return vec3(0.55);
  if (t < 0.5)   return vec3(0.40);
  if (t < 0.625) return vec3(0.28);
  if (t < 0.75)  return vec3(1.00);
  if (t < 0.875) return vec3(0.18);
  return vec3(0.78);
}

void main() {
  vec2 uv = vUv;

  // ── Vertical compression toward screen centre ─────────────────────────────
  // bandHH: half-height in UV space.  0.5 = full viewport,  0.004 = 2-3 px line.
  // ease-out cubic on top of JS smoothstep for a two-stage deceleration
  float ce      = 1.0 - pow(1.0 - uCompress, 3.0);
  float bandHH  = mix(0.5, 0.004, ce);
  float topEdge = 0.5 - bandHH;
  float botEdge = 0.5 + bandHH;

  if (uv.y < topEdge || uv.y > botEdge) {
    gl_FragColor = vec4(0.039, 0.039, 0.039, 1.0);
    return;
  }

  // Remap y to [0,1] within the compressed band so wave calculations are stable
  vec2 bUv = vec2(uv.x, (uv.y - topEdge) / (bandHH * 2.0));

  // ── Mouse ripple ──────────────────────────────────────────────────────────
  vec2  mUV     = uMouse * 0.5 + 0.5;
  vec2  toMouse = bUv - mUV;
  toMouse.x    *= uAspect;
  float mDist   = length(toMouse);
  float ripple  = sin(mDist * 30.0 - uTime * 7.0)
                  * smoothstep(0.40, 0.0, mDist)
                  * 0.016
                  * uIntensity;
  if (mDist > 0.001) bUv += (toMouse / mDist) * ripple;

  // ── Multi-frequency sine wave warping ─────────────────────────────────────
  float t = uTime * 0.20;

  float wx = 0.0;
  wx += sin(bUv.y *  5.03  + t)              * 0.165;
  wx += sin(bUv.y * 12.71  - t * 0.61)       * 0.068;
  wx += sin(bUv.y * 27.9   + t * 1.15)       * 0.026;
  wx += sin(bUv.y * 57.4   - t * 1.87)       * 0.010;
  wx *= uIntensity;

  float wy = 0.0;
  wy += sin(bUv.x *  6.17  + t * 0.78)       * 0.048;
  wy += sin(bUv.x * 16.8   - t * 0.42)       * 0.019;
  wy *= uIntensity;

  // Add constant horizontal scroll so the thin line keeps flowing even when
  // the band is only a few pixels tall and y-variation collapses.
  float scroll = uTime * 0.07;

  vec2 wUv = bUv + vec2(wx + scroll, wy);
  wUv.x = fract(wUv.x + 4.0);
  wUv.y = clamp(wUv.y, 0.001, 0.999);

  // ── Block grid ─────────────────────────────────────────────────────────────
  float bh     = 0.006 + hash(vec2(floor(wUv.y / 0.008), 0.0)) * 0.016;
  float bandId = floor(wUv.y / bh);
  float bw     = 0.003 + hash(vec2(bandId * 4.3, 1.0)) * 0.022;

  vec2  blockCell  = floor(wUv / vec2(bw, bh));
  vec2  blockLocal = fract(wUv / vec2(bw, bh));

  float rColor   = hash(blockCell + vec2(0.31, 0.0));
  float rVisible = hash(blockCell + vec2(0.0,  0.57));
  float rType    = hash(blockCell + vec2(1.29, 2.37));

  float gap = 0.18 - uIntensity * 0.10;
  if (rVisible < gap) {
    gl_FragColor = vec4(0.039, 0.039, 0.039, 1.0);
    return;
  }

  vec3 col = grayColor(rColor);

  if (rType > 0.75) {
    float cScale = 2.0 + hash(blockCell + 9.1) * 5.0;
    vec2  cCell  = floor(blockLocal * cScale);
    col = mod(cCell.x + cCell.y, 2.0) > 0.5 ? col : vec3(0.0);
  } else if (rType > 0.92) {
    col = vec3(1.0);
  }

  // ── Completion ping: flash line to white when fully compressed ───────────
  col = mix(col, vec3(1.0), uLinePing * 0.92);

  gl_FragColor = vec4(col, 1.0);
}
