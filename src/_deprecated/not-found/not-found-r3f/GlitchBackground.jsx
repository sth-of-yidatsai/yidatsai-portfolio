import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import store from './useGlitchStore';
import vertexShader   from './glitch-bg.vert.glsl?raw';
import fragmentShader from './glitch-bg.frag.glsl?raw';

export default function GlitchBackground() {
  const matRef    = useRef();
  const pingedRef = useRef(false); // fire ping only once
  const pingT     = useRef(0);     // time ping started

  useFrame(({ clock }) => {
    const m = matRef.current;
    if (!m) return;

    const p   = store.phase;
    const now = clock.getElapsedTime();

    // Linear 0→1 over [0.28, 0.78], then smoothstep
    const t      = Math.min(1.0, Math.max(0, (p - 0.28) / 0.50));
    const smooth = t * t * (3 - 2 * t);
    m.uniforms.uCompress.value  = smooth;
    m.uniforms.uIntensity.value = Math.max(0, 1 - p * 1.3);
    m.uniforms.uTime.value      = now;
    m.uniforms.uMouse.value.set(store.mouse.x, store.mouse.y);
    m.uniforms.uAspect.value    = window.innerWidth / window.innerHeight;

    // Trigger completion ping once when compression crosses 97%
    if (!pingedRef.current && smooth > 0.97) {
      pingedRef.current = true;
      pingT.current     = now;
      store.linePing    = 1;        // DOM layer watches this to start text entrance
    }

    // Reset ping when user scrolls back
    if (smooth < 0.90) {
      pingedRef.current = false;
      store.linePing    = 0;
    }

    // Animate ping envelope: fast rise already done (set to 1),
    // decay over 0.55s — smooth cubic out
    if (pingedRef.current) {
      const elapsed = now - pingT.current;
      const decay   = Math.max(0, 1 - elapsed / 0.55);
      m.uniforms.uLinePing.value = decay * decay; // ease-out quad
    } else {
      m.uniforms.uLinePing.value = 0;
    }
  });

  return (
    <mesh renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uIntensity: { value: 1.0 },
          uCompress:  { value: 0.0 },
          uLinePing:  { value: 0.0 },
          uTime:      { value: 0.0 },
          uMouse:     { value: new THREE.Vector2(0, 0) },
          uAspect:    { value: window.innerWidth / window.innerHeight },
        }}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
