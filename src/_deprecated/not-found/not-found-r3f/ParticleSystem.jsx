import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import store from './useGlitchStore';
import vertexShader   from './particle.vert.glsl?raw';
import fragmentShader from './particle.frag.glsl?raw';
import { isMobile }   from './deviceDetect';
const PARTICLE_COUNT = isMobile ? 2500 : 8000;

// Canvas size for "404" pixel sampling
const CANVAS_W = 512;
const CANVAS_H = 200;

// World units of the visible frustum at z=0 for the default R3F camera (fov=75, z=5)
function viewportWorld() {
  const vpH = 2 * 5 * Math.tan((75 * Math.PI / 180) / 2); // ≈ 9.14 wu
  const vpW = vpH * (window.innerWidth / window.innerHeight);
  return { vpW, vpH };
}

// Draw "404" on an offscreen <canvas> and return lit pixel positions
function sampleFontPixels(scale) {
  const canvas = document.createElement('canvas');
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  const fontOk = document.fonts.check('200px PPHatton');
  ctx.font          = fontOk ? '200 150px PPHatton, serif' : 'bold 130px Arial, sans-serif';
  ctx.textAlign     = 'center';
  ctx.textBaseline  = 'middle';
  ctx.fillText('404', CANVAS_W / 2, CANVAS_H / 2);

  const data   = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      pixels.push({ x: (i / 4) % CANVAS_W, y: Math.floor((i / 4) / CANVAS_W) });
    }
  }
  return pixels;
}

function subsample(arr, count) {
  if (!arr.length) return Array(count).fill({ x: CANVAS_W / 2, y: CANVAS_H / 2 });
  const step = arr.length / count;
  return Array.from({ length: count }, (_, i) => arr[Math.floor(i * step) % arr.length]);
}

export default function ParticleSystem() {
  const geoRef = useRef();
  const matRef = useRef();

  const velX = useRef(new Float32Array(PARTICLE_COUNT));
  const velY = useRef(new Float32Array(PARTICLE_COUNT));

  const formationRef = useRef(new Float32Array(PARTICLE_COUNT * 3));
  const burstRef     = useRef(new Float32Array(PARTICLE_COUNT * 3));

  // 0 = scattered glitch, 1 = "404" formation
  const explodeRef   = useRef(0);
  // Extra scatter from click/press
  const clickRef     = useRef(0);
  const readyRef     = useRef(false);

  const { invalidate } = useThree();

  useEffect(() => {
    store.invalidate = invalidate;
    return () => { store.invalidate = null; };
  }, [invalidate]);

  // ── Initial burst positions (full-screen scatter) ─────────────────────────
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const seeds     = new Float32Array(PARTICLE_COUNT);
    const burst     = burstRef.current;
    const { vpW, vpH } = viewportWorld();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Scatter across the entire viewport (+ 5 % overflow)
      const bx = (Math.random() - 0.5) * vpW * 1.05;
      const by = (Math.random() - 0.5) * vpH * 1.05;
      const bz = (Math.random() - 0.5) * 0.8;

      positions[i * 3]     = bx;
      positions[i * 3 + 1] = by;
      positions[i * 3 + 2] = bz;
      burst[i * 3]         = bx;
      burst[i * 3 + 1]     = by;
      burst[i * 3 + 2]     = bz;
      seeds[i]             = Math.random();
    }
    return { positions, seeds };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sample "404" pixels after fonts load ──────────────────────────────────
  useEffect(() => {
    document.fonts.ready.then(() => {
      const { vpW } = viewportWorld();
      const scale   = (vpW * 0.62) / CANVAS_W;
      const pixels  = sampleFontPixels(scale);
      const sampled = subsample(pixels, PARTICLE_COUNT);
      const form    = formationRef.current;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        form[i * 3]     = (sampled[i].x - CANVAS_W / 2) * scale;
        form[i * 3 + 1] = -(sampled[i].y - CANVAS_H / 2) * scale;
        form[i * 3 + 2] = 0;
      }
      readyRef.current = true;
    });
  }, []);

  // ── Click-to-scatter interaction ──────────────────────────────────────────
  useEffect(() => {
    const onDown = () => gsap.to(clickRef, { current: 1, duration: 0.35, ease: 'power3.in',   overwrite: true });
    const onUp   = () => gsap.to(clickRef, { current: 0, duration: 1.1,  ease: 'power2.out',  overwrite: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup',   onUp);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup',   onUp);
      gsap.killTweensOf(clickRef);
    };
  }, []);

  // ── Frame loop ────────────────────────────────────────────────────────────
  useFrame(({ clock }) => {
    const geo = geoRef.current;
    const mat = matRef.current;
    if (!geo || !mat || !readyRef.current) return;

    const posArr    = geo.attributes.position.array;
    const formation = formationRef.current;
    const burst     = burstRef.current;
    const vx        = velX.current;
    const vy        = velY.current;

    // ── explodeRef: driven by scroll phase (0.25 → 1.0 scroll = 0 → 1 formation)
    const scrollTarget  = Math.max(0, (store.phase - 0.25) / 0.75);
    const clickMod      = clickRef.current;
    const effectTarget  = scrollTarget * (1 - clickMod * 0.88);
    explodeRef.current += (effectTarget - explodeRef.current) * 0.038;
    const explode       = explodeRef.current;

    const stiffness     = 0.05 + explode * 0.05;
    const damping       = 0.72;

    // Mouse repulsion — stronger during glitch phase
    const repulseRadius = 1.5 - explode * 0.6;
    const repulseStr    = 0.07 - explode * 0.04;
    const { vpW, vpH }  = viewportWorld();
    const mx = store.mouse.x * vpW * 0.5;
    const my = store.mouse.y * vpH * 0.5;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const cx = posArr[i3];
      const cy = posArr[i3 + 1];

      const tx = burst[i3]     + (formation[i3]     - burst[i3])     * explode;
      const ty = burst[i3 + 1] + (formation[i3 + 1] - burst[i3 + 1]) * explode;

      vx[i] += (tx - cx) * stiffness;
      vy[i] += (ty - cy) * stiffness;
      vx[i] *= damping;
      vy[i] *= damping;

      const dx   = cx - mx;
      const dy   = cy - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < repulseRadius && dist > 0.001) {
        const force = (1 - dist / repulseRadius) * repulseStr;
        vx[i] += (dx / dist) * force;
        vy[i] += (dy / dist) * force;
      }

      posArr[i3]     += vx[i];
      posArr[i3 + 1] += vy[i];
    }

    geo.attributes.position.needsUpdate = true;
    mat.uniforms.uTime.value  = clock.getElapsedTime();
    mat.uniforms.uPhase.value = store.phase;
  });

  return (
    <points renderOrder={0}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed"    args={[seeds, 1]}     />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 }, uPhase: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
