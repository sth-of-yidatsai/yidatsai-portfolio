import React, {
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./HorizontalScroller.css";
import projects from "../data/projects.json";

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
  const stateRef = useRef({
    isDragging: false,
    dragStartX: 0,
    dragStartThumbLeft: 0,
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInHorizontalSection, setIsInHorizontalSection] = useState(false);
  const [colors, setColors] = useState({
    track: "var(--color-primary)",
    thumb: "var(--color-secondary)",
  });

  // 準備 section 資料
  const sections = useMemo(
    () => [
      {
        id: "vision",
        title: "Vision",
        subtitle: "你中心的世界",
        content: "從你的視角出發，創造無限可能的未來景象。",
        bgColor: "#1a1a1a",
        textColor: "#ffffff",
      },
      {
        id: "mission",
        title: "Mission",
        subtitle: "設計思維",
        content: "以使用者為中心的設計思維，打造更好的體驗。",
        bgColor: "#2d2d2d",
        textColor: "#ffffff",
      },
      {
        id: "works",
        title: "Works",
        subtitle: "精選作品",
        content: "展示我們的創作成果與設計理念。",
        bgColor: "#404040",
        textColor: "#ffffff",
      },
      {
        id: "projects",
        title: "Projects",
        subtitle: "專案展示",
        content: "深入了解每個專案背後的故事。",
        bgColor: "#1a1a1a",
        textColor: "#ffffff",
      },
    ],
    []
  );

  // 計算和設置顏色 - 與 GlobalScrollbar 一致
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
    const colorPrimary = getCSSVar("--color-primary", "#2d2d2d");
    const colorSecondary = getCSSVar("--color-secondary", "#e0e0e0");

    if (darkUnderlay) {
      // 深色底：交換顏色（track 次色、thumb 主色）
      setColors({ track: colorPrimary, thumb: colorSecondary });
    } else {
      // 淺色底：track 主色、thumb 次色
      setColors({ track: colorSecondary, thumb: colorPrimary });
    }
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    const scroller = scrollerRef.current;
    if (!container || !scroller) return;

    const ctx = gsap.context(() => {
      // 計算總寬度
      const totalWidth = sections.length * window.innerWidth;
      gsap.set(scroller, { width: totalWidth });

      // 建立水平滾動動畫
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${totalWidth - window.innerWidth}`,
          onUpdate: (self) => {
            // self.progress 就是 ScrollTrigger 內部的進度 (0-1)
            // 這個值不受頁面其他內容影響，只代表這個水平滾動區域的進度
            console.log(
              "Progress:",
              self.progress,
              "Sections:",
              sections.length,
              "Transform:",
              self.progress * (100 - 100 / sections.length) + "%"
            );
            setScrollProgress(self.progress);
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

      // 水平移動動畫
      tl.to(scroller, {
        x: () => -(totalWidth - window.innerWidth),
        ease: "none",
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

    return () => {
      ctx.revert();
      document.body.classList.remove("horizontal-scrolling");
    };
  }, [sections]);

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

  return (
    <>
      <section ref={containerRef} className="hs-container">
        <div ref={scrollerRef} className="hs-scroller">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`hs-section hs-section-${index} ${
                index > 0 ? "sticky" : ""
              }`}
              style={{
                backgroundColor: section.bgColor,
                color: section.textColor,
              }}
            >
              <div className="hs-section-content">
                <div className="hs-section-number">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h2 className="hs-section-title">{section.title}</h2>
                <h3 className="hs-section-subtitle">{section.subtitle}</h3>
                <p className="hs-section-text">{section.content}</p>

                {/* 如果是 projects section，顯示作品 */}
                {section.id === "projects" && (
                  <div className="hs-projects-grid">
                    {projects.slice(0, 3).map((project, projectIndex) => (
                      <div key={projectIndex} className="hs-project-item">
                        <img
                          src={project.projectImages?.[0]}
                          alt={project.title}
                          className="hs-project-img"
                        />
                        <div className="hs-project-title">{project.title}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
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
