// PostFX: mouse-proximity distortion only.
// The heavy glitch visual is handled by GlitchBackground (shader on a mesh),
// so we no longer need a postprocessing GlitchEffect.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { isMobile } from './deviceDetect';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Effect } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import store from './useGlitchStore';
import distortionGlsl from './distortion.frag.glsl?raw';

class MouseDistortionImpl extends Effect {
  constructor() {
    super('MouseDistortion', distortionGlsl, {
      uniforms: new Map([
        ['uMouse',    new Uniform(new Vector2(0, 0))],
        ['uStrength', new Uniform(0)],
        ['uTime',     new Uniform(0)],
      ]),
    });
  }
}

const MouseDistortion = wrapEffect(MouseDistortionImpl);

export default function PostFX() {
  if (isMobile) return null;

  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const uni = ref.current.uniforms;
    uni.get('uMouse').value.set(store.mouse.x, store.mouse.y);
    // Distortion fades away as world heals
    uni.get('uStrength').value = Math.max(0, 1 - store.phase * 1.5) * 0.8;
    uni.get('uTime').value     = clock.getElapsedTime();
  });

  return (
    <EffectComposer multisampling={0}>
      <MouseDistortion ref={ref} />
    </EffectComposer>
  );
}
