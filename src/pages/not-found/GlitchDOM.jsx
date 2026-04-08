import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import store from "./useGlitchStore";
import ReturnHomeCTA from "./ReturnHomeCTA";
import { isMobile, isTablet, prefersReducedMotion } from "./deviceDetect";

gsap.registerPlugin(ScrollTrigger);

export default function GlitchDOM() {
  const scrollTrackRef = useRef(null);
  const scrollInnerRef = useRef(null);
  const revealedRef    = useRef(false);
  const [skipVisible, setSkipVisible] = useState(isMobile);

  useEffect(() => {
    const track = scrollTrackRef.current;
    const inner = scrollInnerRef.current;
    if (!track || !inner) return;

    // ── Ensure entrance elements start hidden ─────────────────────────────
    gsap.set([".nf-reveal-heading", ".nf-reveal-sub"], { opacity: 0, y: 18 });
    gsap.set(".nf-cta", { opacity: 0, y: 22, visibility: "hidden" });

    const reveal = () => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      setSkipVisible(false);
      gsap.to(".nf-reveal-heading", { opacity: 1, y: 0, duration: 0.7, ease: "expo.out", delay: 0.05 });
      gsap.to(".nf-reveal-sub",     { opacity: 0.5, y: 0, duration: 0.6, ease: "power3.out", delay: 0.18 });
      gsap.to(".nf-cta",            { opacity: 1, y: 0, visibility: "visible", duration: 0.65, ease: "expo.out", delay: 0.34 });
    };

    // ── prefers-reduced-motion: instant reveal ────────────────────────────
    if (prefersReducedMotion) {
      store.phase    = 1;
      store.linePing = 1;
      store.invalidate?.();
      gsap.set([".nf-reveal-heading", ".nf-reveal-sub"], { opacity: 1, y: 0 });
      gsap.set(".nf-cta", { opacity: 1, y: 0, visibility: "visible" });
      revealedRef.current = true;
      setSkipVisible(false);
      return () => {};
    }

    // ── Mobile: auto-play tween, no scroll ───────────────────────────────
    if (isMobile) {
      inner.style.height = "1px";
      const phaseProxy = { value: 0 };
      const tween = gsap.to(phaseProxy, {
        value: 1,
        duration: 2.5,
        delay: 1.5,
        ease: "power1.inOut",
        onUpdate() {
          store.phase = phaseProxy.value;
          store.invalidate?.();
        },
      });

      // rAF watches linePing to trigger reveal
      let rafId;
      const watchPing = () => {
        if (store.linePing > 0) reveal();
        if (!revealedRef.current) rafId = requestAnimationFrame(watchPing);
      };
      rafId = requestAnimationFrame(watchPing);

      return () => {
        tween.kill();
        cancelAnimationFrame(rafId);
      };
    }

    // ── Desktop / Tablet: scroll-driven ──────────────────────────────────
    if (isTablet) inner.style.height = "150vh";

    const onWheel = (e) => {
      track.scrollTop = Math.max(
        0,
        Math.min(track.scrollTop + e.deltaY, inner.offsetHeight - track.offsetHeight),
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

    window.addEventListener("wheel",      onWheel,      { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove",  onTouchMove,  { passive: true });

    ScrollTrigger.scrollerProxy(track, {
      scrollTop(value) {
        if (arguments.length) track.scrollTop = value;
        return track.scrollTop;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });

    // rAF watches linePing to trigger reveal
    let rafId;
    const watchPing = () => {
      if (store.linePing > 0 && !revealedRef.current) reveal();
      if (store.linePing === 0 && store.phase < 0.75 && revealedRef.current) {
        revealedRef.current = false;
        gsap.set([".nf-reveal-heading", ".nf-reveal-sub"], { opacity: 0, y: 18 });
        gsap.set(".nf-cta", { opacity: 0, y: 22, visibility: "hidden" });
      }
      rafId = requestAnimationFrame(watchPing);
    };
    rafId = requestAnimationFrame(watchPing);

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: inner,
          scroller: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          onUpdate: (self) => {
            store.phase = self.progress;
            store.invalidate?.();
          },
        },
      })
        .to(".nf-scroll-hint", { opacity: 0, y: 8, ease: "power1.in", duration: 0.12 }, 0)
        .to(".nf-scanlines",   { opacity: 0.06, ease: "power2.out", duration: 0.80 }, 0);

      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
    };
  }, []);

  // Skip handler for mobile
  const handleSkip = () => {
    gsap.killTweensOf({ value: 0 }); // kill any running phase tween
    const phaseProxy = { value: store.phase };
    gsap.to(phaseProxy, {
      value: 1,
      duration: 0.4,
      ease: "power2.in",
      onUpdate() { store.phase = phaseProxy.value; store.invalidate?.(); },
    });
    setSkipVisible(false);
  };

  return (
    <>
      <div ref={scrollTrackRef} className="nf-scroll-track" aria-hidden="true">
        <div ref={scrollInnerRef} className="nf-scroll-inner" />
      </div>

      <div className="nf-dom-layer">
        <div className="nf-reveal nf-reveal--above">
          <h1 className="nf-reveal-heading">404 Page not found</h1>
          <p className="nf-reveal-sub">
            This page doesn&apos;t exist — or maybe it was never meant to.
          </p>
        </div>

        <div className="nf-reveal nf-reveal--below">
          <ReturnHomeCTA />
        </div>

        {skipVisible && (
          <button className="nf-skip-btn" onClick={handleSkip} aria-label="Skip animation">
            tap to skip
          </button>
        )}

        <div className="nf-ticker" aria-hidden="true">
          <div className="nf-ticker-track">
            {[0, 1].map((setIdx) => (
              <div key={setIdx} className="nf-ticker-set">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="nf-ticker-item">
                    {isMobile ? "REPAIRING" : "SCROLL TO REPAIR"}
                    <span className="nf-ticker-dot">·</span>404 PAGE NOT FOUND<span className="nf-ticker-dot">·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {!isMobile && (
          <p className="nf-scroll-hint" aria-hidden="true">↓ scroll to repair</p>
        )}
      </div>
    </>
  );
}
