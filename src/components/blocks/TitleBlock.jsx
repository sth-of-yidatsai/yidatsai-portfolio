import { memo, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "../../hooks/useTranslation";
import "./TitleBlock.css";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_FILL_COLOR = "var(--gray-50)";
const DEFAULT_EMPTY_COLOR = "var(--gray-500)";

function TitleBlock({
  title = "",
  description = "",
  bgColor,
  emptyColor,
  fillColor,
  labelColor,
}) {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const titleCharsRef = useRef([]);
  const descCharsRef = useRef([]);

  useLayoutEffect(() => {
    const FILL_COLOR = fillColor ?? DEFAULT_FILL_COLOR;
    const EMPTY_COLOR = emptyColor ?? DEFAULT_EMPTY_COLOR;

    const section = sectionRef.current;
    const titleChars = titleCharsRef.current.filter(Boolean);
    const descChars = descCharsRef.current.filter(Boolean);
    const allChars = [...titleChars, ...descChars];
    if (!section || !allChars.length) return;

    /* ── Mobile: entrance animation only, no GSAP pin ── */
    if (window.innerWidth <= 1024) {
      allChars.forEach((c) => {
        c.style.color = FILL_COLOR;
      });
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => section.classList.add("is-visible"));
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -38% 0px" },
      );
      observer.observe(section);
      return () => observer.disconnect();
    }

    /* ── Desktop: GSAP sticky char fill ── */
    allChars.forEach((c) => {
      c.style.color = EMPTY_COLOR;
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
            const filled = Math.round(self.progress * allChars.length);
            allChars.forEach((c, i) => {
              c.style.color = i < filled ? FILL_COLOR : EMPTY_COLOR;
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
  }, [fillColor, emptyColor]);

  return (
    <section
      className="block block--title"
      ref={sectionRef}
      style={bgColor ? { background: bgColor } : undefined}
    >
      <div className="block--title__inner">
        <p
          className="block--title__label"
          style={labelColor ? { color: labelColor } : undefined}
        >
          {t('projectDetail.labelTitle')}
        </p>

        <h2 className="block--title__title">
          {[...title].map((char, i) => (
            <span
              key={i}
              className="block--title__char"
              ref={(el) => {
                titleCharsRef.current[i] = el;
              }}
            >
              {char}
            </span>
          ))}
        </h2>

        {description && (
          <p className="block--title__description">
            {[...description].map((char, i) => (
              <span
                key={i}
                className="block--title__char"
                ref={(el) => {
                  descCharsRef.current[i] = el;
                }}
              >
                {char}
              </span>
            ))}
          </p>
        )}
      </div>
    </section>
  );
}

export default memo(TitleBlock);
