import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import GlitchBackground from './GlitchBackground';
import ParticleSystem   from './ParticleSystem';
import PostFX           from './PostFX';
import store            from './useGlitchStore';

function SceneSetup() {
  const { gl } = useThree();

  // Dark background
  useEffect(() => {
    gl.setClearColor(0x0a0a0a, 1);
  }, [gl]);

  // Mouse NDC tracking
  useEffect(() => {
    const onMove = (e) => {
      store.mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      store.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return null;
}

export default function GlitchScene() {
  return (
    <Canvas
      className="nf-canvas"
      camera={{ fov: 75, position: [0, 0, 5], near: 0.1, far: 100 }}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      frameloop="always"
    >
      <SceneSetup />
      <GlitchBackground />
      <ParticleSystem />
      <PostFX />
    </Canvas>
  );
}
