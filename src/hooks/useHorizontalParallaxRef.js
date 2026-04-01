import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Horizontal scroll-driven parallax via GSAP ScrollTrigger containerAnimation.
 * For use inside a GSAP horizontal pin scroller with id "horizontal-scroll".
 *
 * Usage:
 *   const [frameRef, targetRef] = useHorizontalParallaxRef(6);
 *   <div ref={frameRef} style={{ overflow: "hidden", position: "relative" }}>
 *     <div ref={targetRef} style={{ position: "absolute", left: "-10%", width: "120%" }}>
 *
 * @param {number} xRange  Half the total horizontal travel as % (default: 8).
 *                         Image moves from +xRange to -xRange xPercent.
 */
export function useHorizontalParallaxRef(xRange = 5) {
  const containerRef = useRef(null);
  const targetRef    = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const target    = targetRef.current;
    if (!container || !target) return;

    const st = ScrollTrigger.getById("horizontal-scroll");
    if (!st?.animation) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { xPercent: xRange },
        {
          xPercent: -xRange,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            containerAnimation: st.animation,
            start: "left right",
            end:   "right left",
            scrub: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [xRange]);

  return [containerRef, targetRef];
}
