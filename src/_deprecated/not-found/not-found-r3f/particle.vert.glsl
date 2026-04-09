attribute float aSeed;

uniform float uTime;
uniform float uPhase;  // 0 = glitch/scattered  →  1 = clean "404"

varying float vSeed;
varying float vPhase;

void main() {
  vec3 pos = position;

  // Glitch jitter — shrinks as phase increases
  float jitter = (1.0 - uPhase) * 0.018;
  pos.x += sin(uTime * 17.3 + aSeed * 19.1) * jitter;
  pos.y += cos(uTime * 13.7 + aSeed * 11.3) * jitter * 0.5;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);

  // Size: large square blocks when glitching → small crisp dots when clean.
  // pow() bias: most particles small, a few large (like the reference image).
  float sizeSeed  = fract(aSeed * 127.1 + 0.3);
  float glitchSize = 2.0 + pow(sizeSeed, 2.8) * 30.0; // 2 – 32 px  (skewed small)
  float cleanSize  = mix(1.5, 3.0, fract(aSeed * 311.7 + 0.1));
  // Camera z=5 → normalise: size stays consistent regardless of particle z
  gl_PointSize = mix(glitchSize, cleanSize, uPhase) * (5.0 / -mvPos.z);

  gl_Position = projectionMatrix * mvPos;
  vSeed  = aSeed;
  vPhase = uPhase;
}
