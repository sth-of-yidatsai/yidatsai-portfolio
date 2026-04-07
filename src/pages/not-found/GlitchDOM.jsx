import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import store from './useGlitchStore';
import ReturnHomeCTA from './ReturnHomeCTA';

gsap.registerPlugin(ScrollTrigger);

export default function GlitchDOM() {
  const scrollTrackRef = useRef(null);
  const scrollInnerRef = useRef(null);

  useEffect(() => {
    const track = scrollTrackRef.current;
    const inner = scrollInnerRef.current;
    if (!track || !inner) return;

    // ── Pipe window wheel → internal scroll track ──────────────────────────
    const onWheel = (e) => {
      track.scrollTop = Math.max(
        0,
        Math.min(track.scrollTop + e.deltaY, inner.offsetHeight - track.offsetHeight)
      );
      ScrollTrigger.update();
    };

    let touchY = 0;
    const onTouchStart = (e) => { touchY = e.touches[0].clientY; };
    const onTouchMove  = (e) => {
      track.scrollTop += touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      ScrollTrigger.update();
    };

    window.addEventListener('wheel',      onWheel,      { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: true });

    // ── ScrollTrigger proxy ─────────────────────────────────────────────────
    ScrollTrigger.scrollerProxy(track, {
      scrollTop(value) {
        if (arguments.length) track.scrollTop = value;
        return track.scrollTop;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:  inner,
          scroller: track,
          start:    'top top',
          end:      'bottom bottom',
          scrub:    1.4,
          onUpdate: (self) => {
            store.phase = self.progress;
            store.invalidate?.();
          },
        },
      });

      // ── 0 %  →  15 %: scroll hint disappears ─────────────────────────────
      tl.to('.nf-scroll-hint', { opacity: 0, y: 8, ease: 'power1.in', duration: 0.15 }, 0)

      // ── 0 %  →  50 %: scanlines tighten ──────────────────────────────────
        .to('.nf-scanlines', { opacity: 0.18, ease: 'power2.out' }, 0.5)

      // ── 78 % → 95 %: CTA slides in ───────────────────────────────────────
        .fromTo(
          '.nf-cta',
          { opacity: 0, y: 40, visibility: 'hidden' },
          { opacity: 1, y: 0,  visibility: 'visible', ease: 'expo.out', duration: 0.22 },
          0.78
        )

      // ── 85 % → 100 %: scanlines near-zero for a clean finish ─────────────
        .to('.nf-scanlines', { opacity: 0.06, ease: 'power1.out', duration: 0.15 }, 0.85);

      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
    };
  }, []);

  return (
    <>
      {/* Invisible 300vh scroll track */}
      <div ref={scrollTrackRef} className="nf-scroll-track" aria-hidden="true">
        <div ref={scrollInnerRef} className="nf-scroll-inner" />
      </div>

      {/* DOM layer — CTA + scroll hint only, no text content */}
      <div className="nf-dom-layer">
        <ReturnHomeCTA />
        <p className="nf-scroll-hint" aria-hidden="true">↓ scroll to repair</p>
      </div>
    </>
  );
}
