import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Debounced refresh — multiple images loading at the same time
// collapse into a single ScrollTrigger.refresh() call.
let _refreshTimer = null;
function scheduleRefresh() {
  clearTimeout(_refreshTimer);
  _refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
}

/**
 * One-shot viewport reveal hook.
 * Adds `.is-revealed` only when BOTH conditions are met:
 *   1. The wrapper has entered the viewport (IntersectionObserver)
 *   2. The <img> inside has finished loading
 *
 * After the image loads, ScrollTrigger.refresh() is scheduled (debounced)
 * so that Lenis re-calculates the correct page height even when containers
 * had no intrinsic height before the image loaded (e.g. no aspect-ratio).
 *
 * Usage:
 *   const revealRef = useScrollReveal();
 *   <div ref={revealRef} className="__img-wrap"> ... </div>
 */
export function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let inView = false;
    let imgReady = false;

    function tryReveal() {
      if (inView && imgReady) {
        el.classList.add("is-revealed");
      }
    }

    const img = el.querySelector("img");
    if (img) {
      if (img.complete && img.naturalWidth > 0) {
        imgReady = true;
        el.classList.add("is-loaded");
        scheduleRefresh();
      } else {
        const onLoad = () => {
          imgReady = true;
          el.classList.add("is-loaded");
          scheduleRefresh();
          tryReveal();
        };
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", onLoad, { once: true }); // fail gracefully
      }
    } else {
      imgReady = true;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          inView = true;
          tryReveal();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
