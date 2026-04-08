import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import store from "./useGlitchStore";
import ReturnHomeCTA from "./ReturnHomeCTA";

gsap.registerPlugin(ScrollTrigger);

export default function GlitchDOM() {
  const scrollTrackRef = useRef(null);
  const scrollInnerRef = useRef(null);
  const revealedRef = useRef(false); // guard: fire entrance once

  useEffect(() => {
    const track = scrollTrackRef.current;
    const inner = scrollInnerRef.current;
    if (!track || !inner) return;

    // ── Ensure entrance elements start hidden ─────────────────────────────
    gsap.set([".nf-reveal-heading", ".nf-reveal-sub"], { opacity: 0, y: 18 });
    gsap.set(".nf-cta", { opacity: 0, y: 22, visibility: "hidden" });

    // ── Wheel / touch → internal scroll track ─────────────────────────────
    const onWheel = (e) => {
      track.scrollTop = Math.max(
        0,
        Math.min(
          track.scrollTop + e.deltaY,
          inner.offsetHeight - track.offsetHeight,
        ),
      );
      ScrollTrigger.update();
    };

    let touchY = 0;
    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      track.scrollTop += touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      ScrollTrigger.update();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    ScrollTrigger.scrollerProxy(track, {
      scrollTop(value) {
        if (arguments.length) track.scrollTop = value;
        return track.scrollTop;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    // ── rAF loop: watch store.linePing to trigger entrance ────────────────
    let rafId;
    const watchPing = () => {
      if (store.linePing > 0 && !revealedRef.current) {
        revealedRef.current = true;
        // Elegant staggered entrance — triggered by the white flash
        gsap.to(".nf-reveal-heading", {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "expo.out",
          delay: 0.05,
        });
        gsap.to(".nf-reveal-sub", {
          opacity: 0.5,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          delay: 0.18,
        });
        gsap.to(".nf-cta", {
          opacity: 1,
          y: 0,
          visibility: "visible",
          duration: 0.65,
          ease: "expo.out",
          delay: 0.34,
        });
      }
      // Reset if user scrolls back
      if (store.linePing === 0 && store.phase < 0.75 && revealedRef.current) {
        revealedRef.current = false;
        gsap.set([".nf-reveal-heading", ".nf-reveal-sub"], {
          opacity: 0,
          y: 18,
        });
        gsap.set(".nf-cta", { opacity: 0, y: 22, visibility: "hidden" });
      }
      rafId = requestAnimationFrame(watchPing);
    };
    rafId = requestAnimationFrame(watchPing);

    // ── ScrollTrigger: only drives phase + scanlines (no text tweens) ─────
    const ctx = gsap.context(() => {
      gsap
        .timeline({
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
        .to(
          ".nf-scroll-hint",
          { opacity: 0, y: 8, ease: "power1.in", duration: 0.12 },
          0,
        )
        .to(
          ".nf-scanlines",
          { opacity: 0.06, ease: "power2.out", duration: 0.8 },
          0,
        );

      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

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

        <div className="nf-ticker" aria-hidden="true">
          <div className="nf-ticker-track">
            {/* Two identical sets — animation moves exactly -50% (one set), then resets seamlessly */}
            {[0, 1].map((setIdx) => (
              <div key={setIdx} className="nf-ticker-set">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="nf-ticker-item">
                    SCROLL TO REPAIR<span className="nf-ticker-dot">·</span>404 PAGE NOT FOUND<span className="nf-ticker-dot">·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
