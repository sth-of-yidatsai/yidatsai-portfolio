// Screen-space quad — bypass camera matrices entirely.
// PlaneGeometry(2,2) positions: local xy ∈ [-1,1], which ARE clip coordinates.
varying vec2 vUv;

void main() {
  vUv = uv;                                    // [0,1] UV from PlaneGeometry
  gl_Position = vec4(position.xy, 0.999, 1.0); // directly in clip space
}
