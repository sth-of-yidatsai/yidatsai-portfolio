import { useRef, useLayoutEffect, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildSrcSet } from "../../../utils/imgSrcSet";
import { useTranslation } from "../../../hooks/useTranslation";
import "./BioSection.css";

gsap.registerPlugin(ScrollTrigger);

/* ── Sticky text block ───────────────────────────────────────────────── */
function StickyText({ text, label, isFirst = false }) {
  const sectionRef = useRef(null);
  const charsRef = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    // Re-read refs after text prop changes (new language may have different char count)
    const chars = charsRef.current.filter(Boolean);
    if (!section || !chars.length) return;

    /* ── Tablet/Mobile: entrance animation only, no GSAP pin ── */
    if (window.innerWidth <= 1024) {
      chars.forEach((c) => {
        c.style.color = "var(--gray-50)";
      });

      if (isFirst) {
        // 字1：loader 開始退場後 500ms 觸發，與 loader 1s 退場動畫交疊完成
        const onExitStart = () => {
          setTimeout(() => section.classList.add("is-visible"), 500);
        };
        window.addEventListener("loader:exit-start", onExitStart, {
          once: true,
        });
        return () =>
          window.removeEventListener("loader:exit-start", onExitStart);
      }

      // 字2：接近螢幕中央時才觸發（rootMargin 往內縮 25%）
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => section.classList.add("is-visible"));
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -40% 0px" },
      );
      observer.observe(section);
      return () => observer.disconnect();
    }

    /* ── Desktop: GSAP sticky char fill ── */
    chars.forEach((c) => {
      c.style.color = "var(--gray-500)";
    });

    let ctx;
    const setup = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          pin: true,
          start: "top top",
          end: `+=${Math.max(window.innerHeight, section.offsetHeight * 1.1)}`,
          scrub: 0.6,
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
  }, [isFirst, text]);

  return (
    <section className="bs__text-block" ref={sectionRef}>
      <p className="bs__label">{label}</p>
      <p className="bs__text hatton-ultralight">
        {[...text].map((char, i) => (
          <span
            key={i}
            className="bs__char"
            ref={(el) => {
              charsRef.current[i] = el;
            }}
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
  const imgRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section || !img) return;

    const SPEED = 0.25; // fraction of viewport shift

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
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
  const { t, language } = useTranslation();
  const label = t('bio.eyebrow');

  // After language change, StickyText components remount (key changes) and
  // recreate their ScrollTrigger pins. Refresh all triggers so TrajectorySection
  // recalculates its start position against the new pin spacers.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [language]);

  return (
    <div className="bs">
      <StickyText text={t('bio.text1')} label={label} isFirst />
      <ParallaxImage />
      <StickyText text={t('bio.text2')} label={label} />
    </div>
  );
}
