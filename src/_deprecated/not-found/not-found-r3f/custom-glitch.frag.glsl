// Horizontal band displacement + RGB channel separation.
// Creates a controlled VHS/CRT glitch look (reference style) rather than
// the chaotic full-screen corruption of the built-in GlitchEffect.
//
// `inputBuffer` is injected automatically by postprocessing.

uniform float uIntensity; // 0 = off, 1 = max
uniform float uTime;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Early-out when world is healed
  if (uIntensity < 0.003) {
    outputColor = inputColor;
    return;
  }

  // Quantised time — glitch "snaps" between states rather than sliding
  float qt = floor(uTime * 14.0);

  // ── Per-band pseudo-random displacement ──────────────────────────────────
  float numBands = 90.0;
  float band     = floor(uv.y * numBands);

  float n1 = fract(sin(dot(vec2(band, qt),          vec2(127.1, 311.7))) * 43758.5453);
  float n2 = fract(sin(dot(vec2(band * 1.7, qt + 1.0), vec2(269.5, 183.3))) * 12345.6789);

  // ~15 % of bands get a large lateral shift
  float dispX = 0.0;
  if (n1 > 0.85) {
    float dir = n2 > 0.5 ? 1.0 : -1.0;
    dispX     = dir * (n1 - 0.85) * uIntensity * 0.65;
  }

  // Micro-jitter on every band (creates the fine scan-line texture)
  float micro = (fract(sin(band * 391.3 + qt * 0.37) * 8765.43) - 0.5)
                * uIntensity * 0.007;
  dispX += micro;

  // ── RGB chromatic aberration ──────────────────────────────────────────────
  float chroma = uIntensity * 0.024;

  float r = texture2D(inputBuffer, clamp(vec2(uv.x + dispX + chroma, uv.y), 0.001, 0.999)).r;
  float g = texture2D(inputBuffer, clamp(vec2(uv.x + dispX,          uv.y), 0.001, 0.999)).g;
  float b = texture2D(inputBuffer, clamp(vec2(uv.x + dispX - chroma, uv.y), 0.001, 0.999)).b;

  // ── Purple/cyan cast (like the reference image) ───────────────────────────
  r = min(1.0, r * (1.0 + uIntensity * 0.28));
  b = min(1.0, b * (1.0 + uIntensity * 0.60));

  outputColor = vec4(r, g, b, 1.0);
}
