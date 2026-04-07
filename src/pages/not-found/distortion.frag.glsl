// postprocessing Effect fragment — mouse-driven sine-ripple UV distortion.
// `inputBuffer` is injected by the postprocessing framework.

uniform vec2  uMouse;    // NDC [-1, 1]
uniform float uStrength; // 0–1
uniform float uTime;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Convert mouse from NDC to UV space
  vec2  mouseUV = uMouse * 0.5 + 0.5;
  vec2  toMouse = uv - mouseUV;
  float d       = length(toMouse);

  float wave = sin(d * 22.0 - uTime * 6.0)
               * uStrength
               * smoothstep(0.55, 0.0, d)
               * 0.011;

  vec2 dir    = d > 0.001 ? normalize(toMouse) : vec2(0.0);
  outputColor = texture2D(inputBuffer, uv + dir * wave);
}
