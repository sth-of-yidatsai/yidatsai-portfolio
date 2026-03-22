import { useRef, useState, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useImageParallax } from "../../../hooks/useImageParallax";
import "./TrajectorySection.css";

gsap.registerPlugin(ScrollTrigger);

// Phase 0 → PHASE1_END : cards 0–3 activate in sequence, track is static
// Phase PHASE1_END → 1 : scroll-wrap shifts left to reveal card 4 (the 5th card)
const PHASE1_END    = 0.72;
const CONTENT_SCROLL = 1600; // px of actual content scroll
// End pause (= VH) is added in setup() so the pin holds at 100% for one extra scroll

const CARDS = [
  {
    year: "2026",
    image: "/images/about/01.webp",
    title: "Digital Experience Practice.",
    desc: "Continuously exploring the intersection of visual design and front-end development, creating interfaces that balance clarity, interaction, and aesthetics.",
    period: "2024 — present",
  },
  {
    year: "2024",
    image: "/images/about/02.webp",
    title: "Transition into front-end development.",
    desc: "Shifted from visual design to web development, building a solid foundation in modern technologies and translating design thinking into functional interfaces.",
    period: "2024/09 — present",
  },
  {
    year: "2024",
    image: "/images/about/03.webp",
    title: "Campmate — Bridging UI and system logic.",
    desc: "Led the design and implementation of key features including homepage, coupon system, and admin tools, connecting user experience with backend functionality.",
    period: "2024/05 — 2024/09",
  },
  {
    year: "2024",
    image: "/images/about/04.webp",
    title: "Visual design in practice.",
    desc: "Worked as a visual designer across branding and marketing projects, focusing on typography, layout, and delivering clear visual communication.",
    period: "2022/09 — 2024/03",
  },
  {
    year: "2022",
    image: "/images/about/05.webp",
    title: "NTUA — Visual Communication Design",
    desc: "Studied at National Taiwan University of Arts, building a foundation in visual language, design principles, and creative thinking.",
    period: "2018/09 — 2022/06",
  },
];

const THUMB_PCT = 100 / CARDS.length; // 20% — one card's share of the timeline

export default function TrajectorySection() {
  const innerRef      = useRef(null);
  const scrollWrapRef = useRef(null);
  const trackRef      = useRef(null);
  const lineRef       = useRef(null);
  const fillBarRef    = useRef(null);
  const descRef       = useRef(null);
  const activeIdxRef  = useRef(0);

  // Scrollbar refs
  const scrollbarRef = useRef(null);
  const thumbRef     = useRef(null);
  const stRef        = useRef(null); // stored ScrollTrigger instance
  const dragRef      = useRef({ isDragging: false, startX: 0, startLeft: 0 });

  const [activeIndex,   setActiveIndex]   = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInSection,    setIsInSection]    = useState(false);
  const { scrollClass } = useImageParallax({ inStickySection: isInSection });

  // ── GSAP pin + phase-based scroll ────────────────────────────────────────
  useLayoutEffect(() => {
    const inner      = innerRef.current;
    const scrollWrap = scrollWrapRef.current;
    const track      = trackRef.current;
    if (!inner || !scrollWrap || !track) return;

    let ctx;

    const setup = () => {
      ctx?.revert();
      stRef.current = null;

      const n        = CARDS.length;   // total cards
      const shown    = n - 1;         // cards visible at once (last one starts off-screen)
      const gapCount = shown - 1;     // gaps between the visible cards

      // Read the resolved px value from the track's own padding-left (= --px-page after clamp)
      const pxPagePx = parseFloat(getComputedStyle(track).paddingLeft) || 64;

      // ── Image-first sizing ────────────────────────────────────────────────
      // `shown` square images fill the viewport with a fixed visual gap
      // between adjacent image edges. This prevents overlap at any screen width.
      //
      // Layout: pxPage + shown×imgW + gapCount×VISUAL_GAP = vw − pxPage
      //   → imgW = (vw − 2×pxPage − gapCount×VISUAL_GAP) / shown
      //
      // Card column (cardW = imgW×3/4) is the structural unit; image overhangs
      // by imgW/4 to the right. CSS column gap = VISUAL_GAP + imgW/4 so that
      // the gap between the image right-edge and the next image left-edge is
      // exactly VISUAL_GAP — no overlap possible.
      const VISUAL_GAP = 24; // px between adjacent image edges
      const imgW  = (window.innerWidth - 2 * pxPagePx - gapCount * VISUAL_GAP) / shown;
      const cardW = imgW * (3 / 4);
      const gapPx = VISUAL_GAP + imgW / 4; // CSS column gap

      // Apply CSS variables so cards, steps, img-wrap, desc-wrap and gaps always match
      inner.style.setProperty('--ts-card-w', `${cardW}px`);
      inner.style.setProperty('--ts-img-w',  `${imgW}px`);
      inner.style.setProperty('--ts-gap',    `${gapPx}px`);

      const half = imgW / 2;  // dot/line origin at image centre

      if (lineRef.current) {
        lineRef.current.style.left  = `${half}px`;
        lineRef.current.style.width = `${(n - 1) * (cardW + gapPx)}px`;
      }
      if (fillBarRef.current) {
        fillBarRef.current.style.left  = `${half}px`;
        fillBarRef.current.style.width = "0px";
      }
      // Position desc under card 0 on load
      if (descRef.current) {
        descRef.current.style.transform = `translateX(${pxPagePx}px)`;
      }

      // End pause: hold at 100% for one extra scroll-wheel turn (same as HorizontalScroller)
      const endPause    = window.innerHeight * 0.2;
      const totalScroll = CONTENT_SCROLL + endPause;
      // Fraction of totalScroll that is actual content (0 → 1 maps to content, rest is pause)
      const contentFraction = CONTENT_SCROLL / totalScroll;

      ctx = gsap.context(() => {
        const st = ScrollTrigger.create({
          trigger  : inner,
          pin      : true,
          start    : "top top",
          end      : `+=${totalScroll}`,
          scrub    : 0.5,
          id       : "trajectory-scroll",

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
            const p = self.progress;

            // Clamp to content phase — freeze all effects at 100% during end pause
            const cp = Math.min(1, p / contentFraction);

            setScrollProgress(cp);

            // Phase 2: slide the whole scroll-wrap (cards + timeline together)
            let x = 0;
            if (cp > PHASE1_END) {
              const p2 = (cp - PHASE1_END) / (1 - PHASE1_END);
              x = -(cardW + gapPx) * p2;
            }
            gsap.set(scrollWrap, { x });

            const idx = cp <= PHASE1_END
              ? Math.min(n - 2, Math.round((cp / PHASE1_END) * (n - 2)))
              : n - 1;

            // Fill bar ends exactly at the active dot centre — CSS transition animates between steps
            if (fillBarRef.current) {
              fillBarRef.current.style.width = `${idx * (cardW + gapPx)}px`;
            }

            // Translate desc to follow the active card (x = current scroll-wrap offset)
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

    const onResize = () => { setup(); ScrollTrigger.refresh(); };
    window.addEventListener("resize", onResize);

    return () => {
      setIsInSection(false);
      document.body.classList.remove("trajectory-scrolling");
      ctx?.revert();
      window.removeEventListener("resize", onResize);
    };
  }, []);


  // ── Scrollbar drag handlers ───────────────────────────────────────────────
  const handlePointerDown = (e) => {
    const thumb = thumbRef.current;
    if (!thumb) return;
    dragRef.current = { isDragging: true, startX: e.clientX, startLeft: thumb.offsetLeft };
    thumb.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const track = scrollbarRef.current;
    if (!track || !stRef.current) return;
    const trackW = track.getBoundingClientRect().width;
    const thumbW = trackW * THUMB_PCT / 100;
    const delta  = e.clientX - dragRef.current.startX;
    const newLeft = Math.max(0, Math.min(trackW - thumbW, dragRef.current.startLeft + delta));
    const progress = (trackW - thumbW) > 0 ? newLeft / (trackW - thumbW) : 0;
    const st = stRef.current;
    window.scrollTo({ top: st.start + progress * (st.end - st.start), behavior: "auto" });
    e.preventDefault();
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    thumbRef.current?.releasePointerCapture?.(e.pointerId);
  };

  const handleTrackClick = (e) => {
    if (e.target === thumbRef.current) return;
    const track = scrollbarRef.current;
    if (!track || !stRef.current) return;
    const rect  = track.getBoundingClientRect();
    const thumbW = rect.width * THUMB_PCT / 100;
    const clickX = e.clientX - rect.left;
    const newLeft = Math.max(0, Math.min(rect.width - thumbW, clickX - thumbW / 2));
    const progress = (rect.width - thumbW) > 0 ? newLeft / (rect.width - thumbW) : 0;
    const st = stRef.current;
    window.scrollTo({ top: st.start + progress * (st.end - st.start), behavior: "auto" });
  };

  return (
    <>
      <section className="ts">

        {/* Header — scrolls normally, NOT part of the pinned 100vh */}
        <div className="ts__header">
          <h2 className="ts__title">Trajectory</h2>
          <p className="ts__subtitle">Selected Path of Practice</p>
        </div>

        {/* Pinned viewport — 100vh, content vertically centred */}
        <div className="ts__inner" ref={innerRef}>

          {/* Scroll wrapper — track + timeline translate together in Phase 2 */}
          <div className="ts__scroll-wrap" ref={scrollWrapRef}>

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
                      className={`ts__img ${scrollClass}`}
                      src={card.image}
                      alt={card.title}
                      draggable="false"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline row */}
            <div className="ts__timeline-row">
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

          {/* Description wrapper — JS sets translateX to follow active card + Phase 2 offset.
              Inner div uses key={activeIndex} so React remounts it on each change,
              re-triggering the CSS slide-up animation automatically. */}
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

      {/* Custom horizontal scrollbar — mirrors HorizontalScroller pattern */}
      <div
        className={`ts__scrollbar${isInSection ? " ts__scrollbar--active" : ""}`}
        ref={scrollbarRef}
        onMouseDown={handleTrackClick}
      >
        <div
          className="ts__scrollbar-thumb"
          ref={thumbRef}
          style={{
            left : `${scrollProgress * (100 - THUMB_PCT)}%`,
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
