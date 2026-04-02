import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildSrcSet } from "../../../utils/imgSrcSet";
import "./BioSection.css";

gsap.registerPlugin(ScrollTrigger);

const TEXT1 =
  "Yida Tsai is a multidisciplinary designer based in Taipei, working between visual design and digital experience. His practice spans from interface design to printed matter, exploring how ideas take form across different mediums.";

const TEXT2 =
  "With a foundation in visual communication and experience in both digital and editorial projects, he focuses on clarity, structure, and the translation of design into tangible outcomes.";

/* ── Sticky text block ───────────────────────────────────────────────── */
function StickyText({ text }) {
  const sectionRef = useRef(null);
  const charsRef   = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const chars   = charsRef.current.filter(Boolean);
    if (!section || !chars.length) return;

    chars.forEach(c => { c.style.color = "var(--gray-500)"; });

    let ctx;
    const setup = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          pin:     true,
          start:   "top top",
          end:     `+=${window.innerHeight * 1.8}`,
          scrub:   0.6,
          onUpdate(self) {
            const filled = Math.round(self.progress * chars.length);
            chars.forEach((c, i) => {
              c.style.color = i < filled ? "var(--gray-50)" : "var(--gray-500)";
            });
          },
        });
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
    <section className="bs__text-block" ref={sectionRef}>
      <p className="bs__label">About</p>
      <p className="bs__text hatton-ultralight">
        {[...text].map((char, i) => (
          <span
            key={i}
            className="bs__char"
            ref={el => { charsRef.current[i] = el; }}
          >
            {char}
          </span>
        ))}
      </p>
    </section>
  );
}

/* ── Sticky image block ──────────────────────────────────────────────── */
function StickyImage() {
  const sectionRef  = useRef(null);
  const imgWrapRef  = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const imgWrap = imgWrapRef.current;
    if (!section || !imgWrap) return;

    let ctx;
    const setup = () => {
      ctx?.revert();

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Portrait 4:3 initial size (height = 60vh)
      const initH = vh * 0.60;
      const initW = initH * (3 / 4);

      gsap.set(imgWrap, { width: initW, height: initH });

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger:  section,
            pin:      true,
            start:    "top top",
            end:      `+=${vh * 1.0}`,   // ← reduced from 1.8
            scrub:    0.6,
          },
        });

        tl.to(imgWrap, {
          width:    vw,
          height:   vh,
          ease:     "none",
          duration: 1,
        });
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
    <section className="bs__img-block" ref={sectionRef}>
      <div className="bs__img-wrap" ref={imgWrapRef}>
        <img
          className="bs__img"
          src="/images/about/01.webp"
          srcSet={buildSrcSet("/images/about/01.webp")}
          sizes="100vw"
          alt=""
          draggable="false"
        />
      </div>
    </section>
  );
}

/* ── Root ────────────────────────────────────────────────────────────── */
export default function BioSection() {
  return (
    <div className="bs">
      <StickyText text={TEXT1} />
      <StickyImage />
      <StickyText text={TEXT2} />
    </div>
  );
}
