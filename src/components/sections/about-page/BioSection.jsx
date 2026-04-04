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
          end:     `+=${Math.max(window.innerHeight, section.offsetHeight * 1.1)}`,
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

/* ── Parallax image block ────────────────────────────────────────────── */
function ParallaxImage() {
  const sectionRef = useRef(null);
  const imgRef     = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const img     = imgRef.current;
    if (!section || !img) return;

    const SPEED = 0.25; // fraction of viewport shift

    const onScroll = () => {
      const rect     = section.getBoundingClientRect();
      const progress = rect.top / window.innerHeight; // 1→entering, 0→centered, -1→leaving
      img.style.transform = `translateY(${progress * SPEED * 100}%)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="bs__img-block" ref={sectionRef}>
      <img
        className="bs__img"
        ref={imgRef}
        src="/images/about/01.webp"
        srcSet={buildSrcSet("/images/about/01.webp")}
        sizes="100vw"
        alt=""
        draggable="false"
      />
    </section>
  );
}

/* ── Root ────────────────────────────────────────────────────────────── */
export default function BioSection() {
  return (
    <div className="bs">
      <StickyText text={TEXT1} />
      <ParallaxImage />
      <StickyText text={TEXT2} />
    </div>
  );
}
