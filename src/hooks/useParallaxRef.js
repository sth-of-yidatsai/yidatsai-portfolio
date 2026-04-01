import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-driven image parallax via GSAP ScrollTrigger scrub.
 *
 * Usage:
 *   const [frameRef, imgRef] = useParallaxRef();
 *   <div ref={frameRef} style={{ overflow: "hidden", position: "relative" }}>
 *     <img ref={imgRef} style={{ height: "120%", position: "absolute", top: 0 }} />
 *   </div>
 *
 * The image must be oversized in CSS (height: 120%) to give room for translation.
 * Container must have overflow: hidden.
 *
 * @param {number} yRange  Total vertical travel as % of image's own height (default: 15).
 *                         With height:120%, a yRange of 15 → 18% of container travel.
 */
export function useParallaxRef(yRange = 8) {
  const containerRef = useRef(null);
  const targetRef    = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const target    = targetRef.current;
    if (!container || !target) return;

    const ctx = gsap.context(() => {
      gsap.to(target, {
        yPercent: -yRange,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start:   "top bottom",
          end:     "bottom top",
          scrub:   true,
        },
      });
    });

    return () => ctx.revert();
  }, [yRange]);

  return [containerRef, targetRef];
}
