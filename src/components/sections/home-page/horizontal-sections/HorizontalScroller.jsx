import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./HorizontalScroller.css";
import {
  ApproachSection,
  LandscapeSection,
  ProjectsSection,
  sectionConfigs,
} from "./";

function getCSSVar(name, fallback) {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalScroller() {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  const scrollbarRef = useRef(null);
  const thumbRef = useRef(null);
  const gsapContextRef = useRef(null); // 追蹤GSAP context
  const stateRef = useRef({
    isDragging: false,
    dragStartX: 0,
    dragStartThumbLeft: 0,
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [landscapeProgress, setLandscapeProgress] = useState(0);
  const [landscapeFullscreenProgress, setLandscapeFullscreenProgress] = useState(0);
  const [isInHorizontalSection, setIsInHorizontalSection] = useState(false);
  const colors = {
    track: getCSSVar("--gray-100", "#e0e0e0"),
    thumb: getCSSVar("--gray-800", "#1a1a1a"),
  };

  // 檢測是否為平板/手機（≤1024px），切換至垂直佈局
  const [isTablet, setIsTablet] = useState(() => window.innerWidth <= 1024);
  // 檢測是否為手機（≤768px），僅用於觸控敏感度調整
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setIsTablet(width <= 1024);
      setIsMobile(width <= 768);
    };

    window.addEventListener("resize", checkBreakpoints);
    return () => window.removeEventListener("resize", checkBreakpoints);
  }, []);

  // 使用導入的 section 配置
  const sections = sectionConfigs;

  useLayoutEffect(() => {
    if (isTablet) return; // 平板/手機使用垂直佈局，跳過 GSAP

    const container = containerRef.current;
    const scroller = scrollerRef.current;
    if (!container || !scroller) return;

    // 桌面：啟用水平滾動（觸控設備有優化的觸控處理）

    const ctx = gsap.context(() => {
      const VW = window.innerWidth;
      const VH = window.innerHeight;
      const totalWidth = sections.length * VW;
      gsap.set(scroller, { width: totalWidth });

      // ── Scroll distance constants ──────────────────────────────────
      const startPauseH = VH * 0.1;
      const endPauseH   = VH * 0.2;

      // Landscape section pause zone (2 image transitions × VH each)
      const landscapeIdx = sections.findIndex((s) => s.id === "landscape");
      const landscapePauseH      = landscapeIdx !== -1 ? VH * 2 : 0;
      const landscapeFullscreenH = landscapeIdx !== -1 ? VH * 1 : 0; // fullscreen expand phase

      // Horizontal distances split around landscape pause
      const horizBefore = landscapeIdx !== -1 ? landscapeIdx * VW : (sections.length - 1) * VW;
      const horizAfter  = landscapeIdx !== -1 ? (sections.length - 1 - landscapeIdx) * VW : 0;
      const totalHoriz  = horizBefore + horizAfter;

      const totalScrollDistance =
        startPauseH + horizBefore + landscapePauseH + landscapeFullscreenH + horizAfter + endPauseH;

      // ── Normalised thresholds (fraction of totalScrollDistance) ───
      const t1  = startPauseH / totalScrollDistance;                                                                            // end of start pause
      const t2  = (startPauseH + horizBefore) / totalScrollDistance;                                                           // landscape centred
      const t3  = (startPauseH + horizBefore + landscapePauseH) / totalScrollDistance;                                         // image transitions done
      const t3b = (startPauseH + horizBefore + landscapePauseH + landscapeFullscreenH) / totalScrollDistance;                  // fullscreen expand done
      const t4  = (startPauseH + horizBefore + landscapePauseH + landscapeFullscreenH + horizAfter) / totalScrollDistance;     // end of horiz scroll

      // ── Duration fractions for GSAP timeline ──────────────────────
      const d_start      = startPauseH        / totalScrollDistance;
      const d_hBefore    = horizBefore        / totalScrollDistance;
      const d_lPause     = landscapePauseH    / totalScrollDistance;
      const d_lFullscreen = landscapeFullscreenH / totalScrollDistance;
      const d_hAfter     = horizAfter         / totalScrollDistance;
      const d_end        = endPauseH          / totalScrollDistance;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: 0.5,
          start: "top top",
          end: () => `+=${totalScrollDistance}`,
          invalidateOnRefresh: true,
          id: "horizontal-scroll",
          onUpdate: (self) => {
            let hProgress = 0;
            let lProgress = 0;
            let fsProgress = 0;

            if (self.progress <= t1) {
              // Start pause
              hProgress = 0;
              lProgress = 0;
              fsProgress = 0;
            } else if (self.progress <= t2) {
              // Scrolling toward landscape
              const frac = (t2 - t1) > 0 ? (self.progress - t1) / (t2 - t1) : 0;
              hProgress  = totalHoriz > 0 ? frac * (horizBefore / totalHoriz) : 0;
              lProgress  = 0;
              fsProgress = 0;
            } else if (self.progress <= t3) {
              // Landscape pause — image transitions
              hProgress  = totalHoriz > 0 ? horizBefore / totalHoriz : 0;
              lProgress  = (t3 - t2) > 0 ? (self.progress - t2) / (t3 - t2) : 0;
              fsProgress = 0;
            } else if (self.progress <= t3b) {
              // Landscape fullscreen expand
              hProgress  = totalHoriz > 0 ? horizBefore / totalHoriz : 0;
              lProgress  = 1;
              fsProgress = (t3b - t3) > 0 ? (self.progress - t3) / (t3b - t3) : 0;
            } else if (self.progress <= t4) {
              // Scrolling from landscape to end
              const frac = (t4 - t3b) > 0 ? (self.progress - t3b) / (t4 - t3b) : 0;
              hProgress  = totalHoriz > 0
                ? horizBefore / totalHoriz + frac * (horizAfter / totalHoriz)
                : frac;
              lProgress  = 1;
              fsProgress = 1;
            } else {
              // End pause
              hProgress  = 1;
              lProgress  = 1;
              fsProgress = 1;
            }

            setScrollProgress(hProgress);
            setLandscapeProgress(lProgress);
            setLandscapeFullscreenProgress(fsProgress);
          },
          onEnter: () => {
            setIsInHorizontalSection(true);
            document.body.classList.add("horizontal-scrolling");
          },
          onLeave: () => {
            setIsInHorizontalSection(false);
            document.body.classList.remove("horizontal-scrolling");
          },
          onEnterBack: () => {
            setIsInHorizontalSection(true);
            document.body.classList.add("horizontal-scrolling");
          },
          onLeaveBack: () => {
            setIsInHorizontalSection(false);
            document.body.classList.remove("horizontal-scrolling");
          },
        },
      });

      // ── Build timeline ─────────────────────────────────────────────
      // Phase 1: start pause (x stays at 0)
      tl.to(scroller, { x: 0, ease: "none", duration: d_start });

      if (landscapeIdx !== -1) {
        // Phase 2: scroll from approach to landscape centre
        if (horizBefore > 0) {
          tl.to(scroller, { x: -horizBefore, ease: "none", duration: d_hBefore });
        }
        // Phase 3 (gap): landscape image-transition pause.
        // No x tween is added here — GSAP holds x at -horizBefore for d_lPause time.
        // Phase 4 is positioned "+=${d_lPause}" after the end of Phase 2/3.
        if (horizAfter > 0) {
          tl.to(
            scroller,
            { x: -(horizBefore + horizAfter), ease: "none", duration: d_hAfter },
            `+=${d_lPause + d_lFullscreen}`   // ← gap: landscape transitions + fullscreen expand
          );
        }
        // Phase 5: end pause
        tl.to(scroller, { x: -totalHoriz, ease: "none", duration: d_end });
      } else {
        // No landscape — plain horizontal scroll then end pause
        tl.to(scroller, { x: -totalHoriz, ease: "none", duration: d_hBefore + d_hAfter });
        tl.to(scroller, { x: -totalHoriz, ease: "none", duration: d_end });
      }
    }, container);

    // 存儲context到ref
    gsapContextRef.current = ctx;

    return () => {
      try {
        // 先清理ScrollTrigger，再清理context
        const triggers = ScrollTrigger.getAll();
        triggers.forEach((trigger) => {
          if (
            trigger.trigger === container ||
            trigger.trigger?.contains(container) ||
            container.contains(trigger.trigger)
          ) {
            trigger.kill(true);
          }
        });

        // 清理所有相關的GSAP動畫
        gsap.killTweensOf(scroller);
        gsap.killTweensOf(container);

        // 最後清理context
        if (gsapContextRef.current) {
          gsapContextRef.current.revert();
          gsapContextRef.current = null;
        }

        document.body.classList.remove("horizontal-scrolling");
      } catch (e) {
        console.warn("GSAP cleanup warning:", e);
      }
    };
  }, [sections]);

  // 添加觸控事件處理，針對移動設備優化滑動體驗
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let isHorizontalSwipe = false;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isHorizontalSwipe = false;
    };

    const handleTouchMove = (e) => {
      if (!isInHorizontalSection) return;

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - touchStartX;
      const deltaY = touchY - touchStartY;

      // 針對移動設備優化的滑動檢測
      const minSwipeDistance = isMobile ? 5 : 10; // 移動設備更敏感
      const swipeMultiplier = isMobile ? 3 : 2; // 移動設備更高的滑動倍數

      // 判斷是否為水平滑動
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        isHorizontalSwipe = true;
        e.preventDefault(); // 阻止垂直滾動

        // 針對移動設備優化的滑動敏感度
        const scrollDelta = -deltaX * swipeMultiplier;
        window.scrollBy(0, scrollDelta);

        // 更新觸控起始點，實現連續滑動
        touchStartX = touchX;
        touchStartY = touchY;
      }
    };

    const handleTouchEnd = (e) => {
      if (isHorizontalSwipe) {
        e.preventDefault();
      }
    };

    // 添加觸控事件監聽器
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isInHorizontalSection, isMobile, isTablet]); // 保留isMobile依賴用於觸控敏感度

  // 自訂滾動條處理 - 修正為只計算水平滾動區域內的進度
  const handlePointerDown = (e) => {
    const thumbEl = thumbRef.current;
    if (!thumbEl) return;
    stateRef.current.isDragging = true;
    stateRef.current.dragStartX = e.clientX;
    stateRef.current.dragStartThumbLeft = thumbEl.offsetLeft;
    thumbEl.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e) => {
    if (!stateRef.current.isDragging) return;
    const trackEl = scrollbarRef.current;
    const container = containerRef.current;
    if (!trackEl || !container) return;

    const trackRect = trackEl.getBoundingClientRect();
    const thumbWidth = trackRect.width / sections.length;
    const delta = e.clientX - stateRef.current.dragStartX;
    const newLeft = Math.max(
      0,
      Math.min(
        trackRect.width - thumbWidth,
        stateRef.current.dragStartThumbLeft + delta
      )
    );

    // 計算在水平滾動區域內的相對進度 (0-1)
    const progress =
      trackRect.width - thumbWidth > 0
        ? newLeft / (trackRect.width - thumbWidth)
        : 0;

    // 獲取水平滾動區域的 ScrollTrigger 實例
    const trigger = ScrollTrigger.getAll().find(
      (st) => st.trigger === container
    );
    if (trigger) {
      const startScroll = trigger.start;
      const endScroll = trigger.end;
      const targetScroll = startScroll + progress * (endScroll - startScroll);

      window.scrollTo({
        top: targetScroll,
        behavior: "auto",
      });
    }
    e.preventDefault();
  };

  const handlePointerUp = (e) => {
    if (!stateRef.current.isDragging) return;
    stateRef.current.isDragging = false;
    const thumbEl = thumbRef.current;
    if (thumbEl) thumbEl.releasePointerCapture?.(e.pointerId);
  };

  const handleTrackClick = (e) => {
    if (e.target === thumbRef.current) return;
    const trackEl = scrollbarRef.current;
    const container = containerRef.current;
    if (!trackEl || !container) return;

    const rect = trackEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const thumbWidth = rect.width / sections.length;
    const nextLeft = Math.max(
      0,
      Math.min(rect.width - thumbWidth, clickX - thumbWidth / 2)
    );

    // 計算在水平滾動區域內的相對進度 (0-1)
    const progress =
      rect.width - thumbWidth > 0 ? nextLeft / (rect.width - thumbWidth) : 0;

    // 獲取水平滾動區域的 ScrollTrigger 實例
    const trigger = ScrollTrigger.getAll().find(
      (st) => st.trigger === container
    );
    if (trigger) {
      const startScroll = trigger.start;
      const endScroll = trigger.end;
      const targetScroll = startScroll + progress * (endScroll - startScroll);

      window.scrollTo({
        top: targetScroll,
        behavior: "auto",
      });
    }
  };

  // 平板/手機：垂直堆疊版面
  if (isTablet) {
    return (
      <div className="hs-vertical">
        {sections.map((section, index) => {
          switch (section.id) {
            case "approach":
              return <ApproachSection key={section.id} config={section} index={index} />;
            case "landscape":
              return (
                <LandscapeSection
                  key={section.id}
                  config={section}
                  index={index}
                  landscapeProgress={1}
                  landscapeFullscreenProgress={0}
                />
              );
            case "projects":
              return <ProjectsSection key={section.id} config={section} index={index} />;
            default:
              return null;
          }
        })}
      </div>
    );
  }

  // 桌面：水平滾動版面
  return (
    <>
      <section ref={containerRef} className="hs-container">
        <div ref={scrollerRef} className="hs-scroller">
          {sections.map((section, index) => {
            // 根據 section.id 渲染對應的組件
            const renderSection = () => {
              switch (section.id) {
                case "approach":
                  return <ApproachSection config={section} index={index} />;
                case "landscape":
                  return (
                    <LandscapeSection
                      config={section}
                      index={index}
                      landscapeProgress={landscapeProgress}
                      landscapeFullscreenProgress={landscapeFullscreenProgress}
                    />
                  );
                case "projects":
                  return <ProjectsSection config={section} index={index} />;
                default:
                  return (
                    <div className={`hs-section hs-section-${index}`}></div>
                  );
              }
            };

            return <div key={section.id}>{renderSection()}</div>;
          })}
        </div>
      </section>

      {/* 自訂水平滾動條 */}
      <div
        className={`hs-horizontal-scrollbar${
          isInHorizontalSection ? " active" : ""
        }`}
        ref={scrollbarRef}
        style={{ "--hs-track": colors.track, "--hs-thumb": colors.thumb }}
        onMouseDown={handleTrackClick}
      >
        <div
          className="hs-scrollbar-thumb"
          ref={thumbRef}
          style={{
            /* 用 left%，以 track 為基準 */
            left: `${scrollProgress * (100 - 100 / sections.length)}%`,
            width: `${100 / sections.length}%`,
            transform: "translateX(0)",
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
