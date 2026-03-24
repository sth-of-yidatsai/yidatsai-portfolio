import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./blocks.css";

gsap.registerPlugin(ScrollTrigger);

export default function CarouselBlock({ images = [] }) {
  const [img1, img2, img3] = images;

  const sectionRef = useRef(null);
  const img1Ref = useRef(null);
  const img2Ref = useRef(null);
  const img3Ref = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const img1El = img1Ref.current;
    const img2El = img2Ref.current;
    const img3El = img3Ref.current;
    if (!section || !img1El) return;

    let ctx;
    const setup = () => {
      ctx?.revert();

      const vh = window.innerHeight;

      // Initial states: img1 visible, img2/img3 hidden
      gsap.set(img1El, { opacity: 1 });
      if (img2El) gsap.set(img2El, { opacity: 0 });
      if (img3El) gsap.set(img3El, { opacity: 0 });

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            pin: true,
            anticipatePin: 1,
            start: "top top",
            end: `+=${vh * 2}`,
            scrub: 0.6,
          },
        });

        // Phase 1: img1 → img2 crossfade
        tl.to(img1El, { opacity: 0, ease: "none", duration: 0.5 }, 0);
        if (img2El) tl.to(img2El, { opacity: 1, ease: "none", duration: 0.5 }, 0);

        // Phase 2: img2 → img3 crossfade
        if (img2El) tl.to(img2El, { opacity: 0, ease: "none", duration: 0.5 }, 0.5);
        if (img3El) tl.to(img3El, { opacity: 1, ease: "none", duration: 0.5 }, 0.5);
      }, section);
    };

    setup();
    window.addEventListener("resize", setup);
    return () => {
      window.removeEventListener("resize", setup);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      className="block--carousel"
      ref={sectionRef}
    >
      <div className="block--carousel__slides">
        {img1 && (
          <img
            ref={img1Ref}
            src={img1}
            alt=""
            className="block--carousel__slide"
          />
        )}
        {img2 && (
          <img
            ref={img2Ref}
            src={img2}
            alt=""
            className="block--carousel__slide"
          />
        )}
        {img3 && (
          <img
            ref={img3Ref}
            src={img3}
            alt=""
            className="block--carousel__slide"
          />
        )}
      </div>
    </section>
  );
}