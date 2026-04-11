import { useRef, useState, useLayoutEffect, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildSrcSet } from "../../../utils/imgSrcSet";
import { useTranslation } from "../../../hooks/useTranslation";
import BilingTitle from "../../BilingTitle";
import "./TrajectorySection.css";

gsap.registerPlugin(ScrollTrigger);

// Desktop: Phase 0 → PHASE1_END cards 0–3 activate, track static
//          Phase PHASE1_END → 1 scroll-wrap shifts left to reveal card 4
const PHASE1_END = 0.72;
const CONTENT_SCROLL = 1600;

const CARD_IMAGES = [
  "/images/about/01.webp",
  "/images/about/02.webp",
  "/images/about/03.webp",
  "/images/about/04.webp",
  "/images/about/05.webp",
];

export default function TrajectorySection() {
  const { t, locale } = useTranslation();
  const CARDS = locale.trajectory.cards.map((card, i) => ({
    ...card,
    image: CARD_IMAGES[i],
  }));
  const THUMB_PCT = 100 / CARDS.length;
  const innerRef = useRef(null);
  const scrollWrapRef = useRef(null);
  const trackRef = useRef(null);
  const lineRef = useRef(null);
  const fillBarRef = useRef(null);
  const descRef = useRef(null);
  const activeIdxRef = useRef(0);
  const metricsRef = useRef(null); // { cardW, gapPx, pxPagePx, isMobile }
  const isMobileRef = useRef(false);

  // Desktop scrollbar
  const scrollbarRef = useRef(null);
  const thumbRef = useRef(null);
  const stRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startLeft: 0 });

  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInSection, setIsInSection] = useState(false);

  // ── Sizing + ScrollTrigger (desktop) / static setup (mobile) ─────────────
  useLayoutEffect(() => {
    const inner = innerRef.current;
    const scrollWrap = scrollWrapRef.current;
    const track = trackRef.current;
    if (!inner || !scrollWrap || !track) return;

    let ctx;

    const setup = () => {
      ctx?.revert();
      stRef.current = null;

      const isMobile = window.innerWidth <= 1024;
      isMobileRef.current = isMobile;

      const n = CARDS.length;
      const shown = isMobile ? 1 : n - 1;
      const gapCount = shown - 1;
      const pxPagePx = parseFloat(getComputedStyle(track).paddingLeft) || 64;
      const VISUAL_GAP = 24;
      const imgW =
        (window.innerWidth - 2 * pxPagePx - gapCount * VISUAL_GAP) / shown;
      const cardW = imgW * (3 / 4);
      const gapPx = VISUAL_GAP + imgW / 4;

      metricsRef.current = { cardW, gapPx, pxPagePx, isMobile, n };

      inner.style.setProperty("--ts-card-w", `${cardW}px`);
      inner.style.setProperty("--ts-img-w", `${imgW}px`);
      inner.style.setProperty("--ts-gap", `${gapPx}px`);

      const half = imgW / 2;
      if (lineRef.current) {
        lineRef.current.style.left = `${half}px`;
        lineRef.current.style.width = `${(n - 1) * (cardW + gapPx)}px`;
      }
      if (fillBarRef.current) {
        fillBarRef.current.style.left = `${half}px`;
        fillBarRef.current.style.width = "0px";
      }

      // ── Mobile: click-based, no ScrollTrigger ───────────────────────────
      if (isMobile) {
        const idx = activeIdxRef.current;
        gsap.set(scrollWrap, { x: -(cardW + gapPx) * idx });
        if (fillBarRef.current) {
          fillBarRef.current.style.width = `${idx * (cardW + gapPx)}px`;
        }
        gsap.set(descRef.current, { x: pxPagePx });
        return;
      }

      // ── Desktop: GSAP pin + scroll ──────────────────────────────────────
      gsap.set(descRef.current, { x: pxPagePx });

      const endPause = window.innerHeight * 0.2;
      const totalScroll = CONTENT_SCROLL + endPause;
      const contentFraction = CONTENT_SCROLL / totalScroll;

      ctx = gsap.context(() => {
        const st = ScrollTrigger.create({
          trigger: inner,
          pin: true,
          start: "top top",
          end: `+=${totalScroll}`,
          scrub: 0.5,
          id: "trajectory-scroll",

          onEnter() {
            setIsInSection(true);
            document.body.classList.add("trajectory-scrolling");
          },
          onLeave() {
            setIsInSection(false);
            document.body.classList.remove("trajectory-scrolling");
          },
          onEnterBack() {
            setIsInSection(true);
            document.body.classList.add("trajectory-scrolling");
          },
          onLeaveBack() {
            setIsInSection(false);
            document.body.classList.remove("trajectory-scrolling");
          },

          onUpdate(self) {
            const cp = Math.min(1, self.progress / contentFraction);
            setScrollProgress(cp);

            let x = 0;
            if (cp > PHASE1_END) {
              const p2 = (cp - PHASE1_END) / (1 - PHASE1_END);
              x = -(cardW + gapPx) * p2;
            }
            gsap.set(scrollWrap, { x });

            const idx =
              cp <= PHASE1_END
                ? Math.min(n - 2, Math.round((cp / PHASE1_END) * (n - 2)))
                : n - 1;

            if (fillBarRef.current) {
              fillBarRef.current.style.width = `${idx * (cardW + gapPx)}px`;
            }
            if (descRef.current) {
              descRef.current.style.transform = `translateX(${pxPagePx + idx * (cardW + gapPx) + x}px)`;
            }

            if (idx !== activeIdxRef.current) {
              activeIdxRef.current = idx;
              setActiveIndex(idx);
            }
          },
        });
        stRef.current = st;
      }, inner);
    };

    setup();

    const onResize = () => {
      setup();
      if (!isMobileRef.current) ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      setIsInSection(false);
      document.body.classList.remove("trajectory-scrolling");
      ctx?.revert();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // ── Mobile: animate to clicked card ──────────────────────────────────────
  useEffect(() => {
    if (!isMobileRef.current) return;
    const m = metricsRef.current;
    if (!m) return;
    const { cardW, gapPx, pxPagePx } = m;

    activeIdxRef.current = activeIndex;
    gsap.to(scrollWrapRef.current, {
      x: -(cardW + gapPx) * activeIndex,
      duration: 0.5,
      ease: "power2.out",
    });
    if (fillBarRef.current) {
      fillBarRef.current.style.width = `${activeIndex * (cardW + gapPx)}px`;
    }
    gsap.to(descRef.current, {
      x: pxPagePx,
      duration: 0.5,
      ease: "power2.out",
    });
  }, [activeIndex]);

  // ── Mobile swipe handlers ─────────────────────────────────────────────────
  const swipeRef = useRef({ startX: 0, startY: 0, locked: false });

  const handleTouchStart = (e) => {
    if (!isMobileRef.current) return;
    swipeRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      locked: false,
    };
  };

  const handleTouchEnd = (e) => {
    if (!isMobileRef.current) return;
    const dx = e.changedTouches[0].clientX - swipeRef.current.startX;
    const dy = e.changedTouches[0].clientY - swipeRef.current.startY;
    // Ignore if mostly vertical (user scrolling page)
    if (Math.abs(dy) > Math.abs(dx)) return;
    // Require at least 40px horizontal movement
    if (Math.abs(dx) < 40) return;
    const n = CARDS.length;
    if (dx < 0) {
      setActiveIndex((prev) => Math.min(prev + 1, n - 1));
    } else {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  // ── Desktop scrollbar drag handlers ──────────────────────────────────────
  const handlePointerDown = (e) => {
    const thumb = thumbRef.current;
    if (!thumb) return;
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startLeft: thumb.offsetLeft,
    };
    thumb.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const bar = scrollbarRef.current;
    if (!bar || !stRef.current) return;
    const barW = bar.getBoundingClientRect().width;
    const thumbW = (barW * THUMB_PCT) / 100;
    const delta = e.clientX - dragRef.current.startX;
    const newLeft = Math.max(
      0,
      Math.min(barW - thumbW, dragRef.current.startLeft + delta),
    );
    const progress = barW - thumbW > 0 ? newLeft / (barW - thumbW) : 0;
    const st = stRef.current;
    window.scrollTo({
      top: st.start + progress * (st.end - st.start),
      behavior: "auto",
    });
    e.preventDefault();
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    thumbRef.current?.releasePointerCapture?.(e.pointerId);
  };

  const handleTrackClick = (e) => {
    if (e.target === thumbRef.current) return;
    const bar = scrollbarRef.current;
    if (!bar || !stRef.current) return;
    const rect = bar.getBoundingClientRect();
    const thumbW = (rect.width * THUMB_PCT) / 100;
    const clickX = e.clientX - rect.left;
    const newLeft = Math.max(
      0,
      Math.min(rect.width - thumbW, clickX - thumbW / 2),
    );
    const progress =
      rect.width - thumbW > 0 ? newLeft / (rect.width - thumbW) : 0;
    const st = stRef.current;
    window.scrollTo({
      top: st.start + progress * (st.end - st.start),
      behavior: "auto",
    });
  };

  return (
    <>
      <section className="ts">
        {/* Header */}
        <div className="ts__header">
          <p className="ts__subtitle">{t('trajectory.eyebrow')}</p>
          <BilingTitle
            en={t('trajectory.title')}
            zh={t('trajectory.titleZh')}
            className="ts__title"
          />
        </div>

        {/* Desktop: pinned 100vh viewport / Mobile: natural height */}
        <div className="ts__inner" ref={innerRef}>
          {/* Scroll wrapper — desktop: slides via ScrollTrigger; mobile: slides via click */}
          <div
            className="ts__scroll-wrap"
            ref={scrollWrapRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Cards track */}
            <div className="ts__track" ref={trackRef}>
              {CARDS.map((card, i) => (
                <div
                  key={i}
                  className={`ts__card${activeIndex === i ? " ts__card--active" : ""}`}
                >
                  <p className="ts__year">{card.year}</p>
                  <div className="ts__img-wrap">
                    <img
                      className="ts__img"
                      src={card.image}
                      srcSet={buildSrcSet(card.image)}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      alt={card.title}
                      draggable="false"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop timeline — inside scroll-wrap, aligned with cards */}
            <div className="ts__timeline-row ts__timeline-row--desktop">
              <div className="ts__timeline">
                <div className="ts__tl-line" ref={lineRef} />
                <div className="ts__timeline-fill" ref={fillBarRef} />
                {CARDS.map((_, i) => (
                  <div
                    key={i}
                    className={`ts__step${activeIndex === i ? " ts__step--active" : ""}`}
                  >
                    <div className="ts__dot-wrap">
                      <span className="ts__dot" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile dots — static row outside scroll-wrap, click to switch card */}
          <div className="ts__timeline-row ts__timeline-row--mobile">
            {CARDS.map((_, i) => (
              <div
                key={i}
                className={`ts__step ts__step--sm${activeIndex === i ? " ts__step--active" : ""}`}
                onClick={() => setActiveIndex(i)}
              >
                <div className="ts__dot-wrap">
                  <span className="ts__dot" />
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="ts__desc-wrap" ref={descRef}>
            <div className="ts__desc" key={activeIndex}>
              <p className="ts__desc-title">{CARDS[activeIndex].title}</p>
              <span className="ts-rule" />
              <p className="ts__desc-body">{CARDS[activeIndex].desc}</p>
              <p className="ts__desc-period">({CARDS[activeIndex].period})</p>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop scrollbar */}
      <div
        className={`ts__scrollbar${isInSection ? " ts__scrollbar--active" : ""}`}
        ref={scrollbarRef}
        onMouseDown={handleTrackClick}
      >
        <div
          className="ts__scrollbar-thumb"
          ref={thumbRef}
          style={{
            left: `${scrollProgress * (100 - THUMB_PCT)}%`,
            width: `${THUMB_PCT}%`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
    </>
  );
}
