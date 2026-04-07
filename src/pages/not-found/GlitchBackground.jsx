import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import store from './useGlitchStore';
import vertexShader   from './glitch-bg.vert.glsl?raw';
import fragmentShader from './glitch-bg.frag.glsl?raw';

// Full-screen procedural block-glitch background.
// Rendered before all other objects (renderOrder=-1).
// The shader bypasses camera projection — PlaneGeometry(2,2) fills clip space.
export default function GlitchBackground() {
  const matRef = useRef();

  useFrame(({ clock }) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uIntensity.value = Math.max(0, 1 - store.phase * 1.3);
    m.uniforms.uTime.value      = clock.getElapsedTime();
    m.uniforms.uMouse.value.set(store.mouse.x, store.mouse.y);
    m.uniforms.uAspect.value    = window.innerWidth / window.innerHeight;
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
