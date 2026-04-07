varying float vSeed;
varying float vPhase;

// 8-colour neon glitch palette — same as background for visual cohesion
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

void main() {
  vec2  pc   = gl_PointCoord - 0.5;   // [-0.5, 0.5]
  float dist = length(pc);

  // ── Shape: square → circle transition as phase increases ──────────────────
  // dist of square corner = 0.707; circle edge = 0.5
  float threshold = mix(0.71, 0.5, vPhase);
  if (dist > threshold) discard;

  // Soft alpha at circle phase, hard at square phase
  float hardAlpha = 1.0;
  float softAlpha = pow(max(0.0, 1.0 - dist * 2.0), 3.5);
  float alpha = mix(hardAlpha, softAlpha, vPhase) * 0.95;

  // ── Colour: random neon (glitch) → white (clean) ──────────────────────────
  vec3 glitchCol = neonColor(vSeed);
  vec3 cleanCol  = vec3(1.0);
  vec3 color     = mix(glitchCol, cleanCol, vPhase);

  gl_FragColor = vec4(color, alpha);
}
