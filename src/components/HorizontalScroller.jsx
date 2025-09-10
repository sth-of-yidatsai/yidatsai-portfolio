import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./HorizontalScroller.css";
import {
  ProjectsSection,
  sectionConfigs,
} from "./sections/horizontal-sections";
import { VisionSection, PracticesSection } from "./sections/vertical-sections";

// 顏色解析和反色邏輯 - 與 GlobalScrollbar 一致
function parseRGBA(color) {
  if (!color) return { r: 255, g: 255, b: 255, a: 1 };
  const ctx = color.trim().toLowerCase();
  if (ctx.startsWith("#")) {
    const hex = ctx.slice(1);
    const to255 = (h) => parseInt(h.length === 1 ? h + h : h, 16);
    if (hex.length === 3) {
      return { r: to255(hex[0]), g: to255(hex[1]), b: to255(hex[2]), a: 1 };
    }
    if (hex.length === 6) {
      return {
        r: to255(hex.slice(0, 2)),
        g: to255(hex.slice(2, 4)),
        b: to255(hex.slice(4, 6)),
        a: 1,
      };
    }
  }
  const m = ctx.match(/rgba?\(([^)]+)\)/);
  if (!m) return { r: 255, g: 255, b: 255, a: 1 };
  const parts = m[1].split(",").map((v) => v.trim());
  const r = parseFloat(parts[0]);
  const g = parseFloat(parts[1]);
  const b = parseFloat(parts[2]);
  const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
  return { r, g, b, a: Number.isNaN(a) ? 1 : a };
}

function isDarkColor(color) {
  const { r, g, b, a } = parseRGBA(color);
  if (a === 0) return false;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.5;
}

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
  const [isInHorizontalSection, setIsInHorizontalSection] = useState(false);
  const [colors, setColors] = useState({
    track: getCSSVar("--scrollbar-track", getCSSVar("--gray-300", "#a6a6a6")),
    thumb: getCSSVar(
      "--scrollbar-thumb-light",
      getCSSVar("--gray-0", "#ffffff")
    ),
  });

  // 檢測是否為移動設備
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768); // 僅用於觸控敏感度調整
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 使用導入的 section 配置
  const sections = sectionConfigs;

  // 計算和設置顏色 - track 固定，只有 thumb 反色
  const computeAndSetColors = () => {
    const trackEl = scrollbarRef.current;
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const cx = Math.min(
      window.innerWidth - 2,
      Math.max(0, rect.left + rect.width / 2)
    );
    const cy = Math.min(
      window.innerHeight - 2,
      Math.max(0, rect.top + rect.height / 2)
    );
    const prev = trackEl.style.pointerEvents;
    trackEl.style.pointerEvents = "none";
    let el = document.elementFromPoint(cx, cy);
    trackEl.style.pointerEvents = prev || "";
    let bg = "";
    while (el && el !== document.documentElement && el !== document.body) {
      const cs = getComputedStyle(el);
      if (
        cs &&
        cs.backgroundColor &&
        cs.backgroundColor !== "rgba(0, 0, 0, 0)" &&
        cs.backgroundColor !== "transparent"
      ) {
        bg = cs.backgroundColor;
        break;
      }
      el = el.parentElement;
    }
    if (!bg) {
      bg =
        getComputedStyle(document.body).backgroundColor || "rgb(255,255,255)";
    }
    const darkUnderlay = isDarkColor(bg);
    const trackColor = getCSSVar(
      "--scrollbar-track",
      getCSSVar("--gray-300", "#a6a6a6")
    );
    const thumbLightColor = getCSSVar(
      "--scrollbar-thumb-light",
      getCSSVar("--gray-0", "#ffffff")
    );
    const thumbDarkColor = getCSSVar(
      "--scrollbar-thumb-dark",
      getCSSVar("--gray-900", "#0a0a0a")
    );

    if (darkUnderlay) {
      // 深色底：track 固定灰色，thumb 淺色
      setColors({ track: trackColor, thumb: thumbLightColor });
    } else {
      // 淺色底：track 固定灰色，thumb 深色
      setColors({ track: trackColor, thumb: thumbDarkColor });
    }
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    const scroller = scrollerRef.current;
    if (!container || !scroller) return;

    // 所有設備都啟用水平滾動，但移動設備有優化的觸控處理

    const ctx = gsap.context(() => {
      // 計算總寬度 - 考慮 Header 的 64px 寬度
      const availableWidth = window.innerWidth - 64;
      const totalWidth = sections.length * availableWidth;
      gsap.set(scroller, { width: totalWidth });

      // 建立水平滾動動畫
      // 增加停頓區域 - 相當於一個螢幕寬度的額外滾動距離
      const pauseZoneHeight = window.innerHeight;
      const horizontalScrollDistance = totalWidth - availableWidth;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${horizontalScrollDistance + pauseZoneHeight}`,
          onUpdate: (self) => {
            // 計算實際的水平滾動進度
            // 當 self.progress 到達水平滾動完成點時，應該保持在 1.0
            const horizontalProgressThreshold =
              horizontalScrollDistance /
              (horizontalScrollDistance + pauseZoneHeight);

            let horizontalProgress;
            if (self.progress <= horizontalProgressThreshold) {
              // 在水平滾動階段
              horizontalProgress = self.progress / horizontalProgressThreshold;
            } else {
              // 在停頓區階段，保持水平滾動完成狀態
              horizontalProgress = 1.0;
            }

            console.log(
              "Total Progress:",
              self.progress,
              "Horizontal Progress:",
              horizontalProgress,
              "Threshold:",
              horizontalProgressThreshold,
              "In Pause Zone:",
              self.progress > horizontalProgressThreshold
            );

            setScrollProgress(horizontalProgress);
            computeAndSetColors();
          },
          onEnter: () => {
            setIsInHorizontalSection(true);
            // 隱藏 GlobalScrollbar
            document.body.classList.add("horizontal-scrolling");
          },
          onLeave: () => {
            setIsInHorizontalSection(false);
            // 顯示 GlobalScrollbar
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

      // 水平移動動畫 - 只在水平滾動階段進行
      // 計算動畫持續時間比例（排除停頓區）
      const animationDuration =
        horizontalScrollDistance / (horizontalScrollDistance + pauseZoneHeight);

      tl.to(scroller, {
        x: () => -(totalWidth - availableWidth),
        ease: "none",
        duration: animationDuration,
      })
        // 在停頓區階段保持位置不變
        .to(scroller, {
          x: () => -(totalWidth - availableWidth),
          ease: "none",
          duration: 1 - animationDuration,
        });

      // Sticky 效果處理
      sections.forEach((_, index) => {
        if (index === 0) return; // 第一個不需要 sticky 效果

        const stickyElement = scroller.querySelector(`.hs-section-${index}`);
        if (stickyElement) {
          gsap.set(stickyElement, {
            position: "sticky",
            left: 0,
            zIndex: index,
          });
        }
      });
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
  }, [isInHorizontalSection, isMobile]); // 保留isMobile依賴用於觸控敏感度

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

  // 初始化顏色
  useEffect(() => {
    computeAndSetColors();
  }, [isInHorizontalSection]);

  // 所有設備都使用水平滾動，但移動設備有優化的觸控體驗
  return (
    <>
      <section ref={containerRef} className="hs-container">
        <div ref={scrollerRef} className="hs-scroller">
          {sections.map((section, index) => {
            // 根據 section.id 渲染對應的組件
            const renderSection = () => {
              switch (section.id) {
                case "practices":
                  return <PracticesSection config={section} index={index} />;
                case "projects":
                  return <ProjectsSection config={section} index={index} />;
                default:
                  return (
                    <div
                      className={`hs-section hs-section-${index} ${
                        index > 0 ? "sticky" : ""
                      }`}
                    ></div>
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
