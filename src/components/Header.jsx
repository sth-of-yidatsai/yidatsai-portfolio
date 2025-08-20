import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import projectsData from "../data/projects.json";
import arrowIcon from "../assets/icons/arrow_outward_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";
import MarqueeText from "./MarqueeText";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  // 控制滾動條顯示/隱藏
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    // 告知其他頁面（如 Projects）選單狀態已改變
    try {
      window.dispatchEvent(
        new CustomEvent("menu-open-change", { detail: { isOpen } })
      );
    } catch {
      // 忽略舊瀏覽器的自訂事件錯誤
    }

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isOpen]);

  // 第一次開啟後標記，讓「關閉動畫」僅在曾開啟過之後才會觸發
  useEffect(() => {
    if (isOpen) setHasOpened(true);
  }, [isOpen]);

  // 使用 JSON 資料 - 從 projectImages 的第一張圖片作為輪播圖片
  const images = projectsData.map((project) => project.projectImages[0]);

  // 自動輪播
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [isOpen, images.length]);

  // 以螢幕座標採樣 Header 左/右位置下方實際背景亮度，動態設定 CSS 變數
  const sampleAndApply = useCallback(() => {
    const parseRgb = (str) => {
      const m =
        str && str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
      if (!m) return null;
      return {
        r: Number(m[1]),
        g: Number(m[2]),
        b: Number(m[3]),
        a: m[4] !== undefined ? Number(m[4]) : 1,
      };
    };

    const luminance = ({ r, g, b }) => {
      const toLin = (v) => {
        const n = v / 255;
        return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
      };
      const R = toLin(r);
      const G = toLin(g);
      const B = toLin(b);
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    };

    const pickColorFromBackground = (el) => {
      if (!el) return null;
      let node = el;
      for (let i = 0; i < 12 && node; i += 1) {
        const cs = window.getComputedStyle(node);
        const bgImg = cs.backgroundImage;
        if (bgImg && bgImg !== "none") {
          const rgbMatches = bgImg.match(/rgba?\([^)]*\)/g);
          if (rgbMatches && rgbMatches.length) {
            let sum = 0;
            let count = 0;
            for (const rgbStr of rgbMatches) {
              const c = parseRgb(rgbStr);
              if (c) {
                sum += luminance(c);
                count += 1;
              }
            }
            if (count) {
              const avgLum = sum / count;
              return avgLum;
            }
          }
        }
        const bg = cs.backgroundColor;
        const c = parseRgb(bg);
        if (c && c.a > 0) {
          return luminance(c);
        }
        node = node.parentElement;
      }
      const bodyColor = window.getComputedStyle(document.body).backgroundColor;
      const parsed = parseRgb(bodyColor) || { r: 255, g: 255, b: 255 };
      return luminance(parsed);
    };

    const header = headerRef.current;
    if (!header) return;

    const rect = header.getBoundingClientRect();
    const leftPoint = {
      x: Math.max(1, rect.left + 24),
      y: Math.max(1, rect.top + rect.height / 2),
    };
    const rightPoint = {
      x: Math.min(window.innerWidth - 1, rect.right - 24),
      y: Math.max(1, rect.top + rect.height / 2),
    };

    const pickTargetAt = (point) => {
      const stack = document.elementsFromPoint(point.x, point.y);
      const filtered = stack.filter(
        (el) => el !== header && !header.contains(el)
      );
      if (isOpen) {
        return filtered[0] || null;
      }
      const target = filtered.find(
        (el) => !el.closest || !el.closest(".overlay")
      );
      return target || null;
    };

    const leftEl = pickTargetAt(leftPoint);
    const rightEl = pickTargetAt(rightPoint);

    const leftLum = pickColorFromBackground(leftEl);
    const rightLum = pickColorFromBackground(rightEl);

    const leftColor = leftLum !== null && leftLum < 0.5 ? "#ffffff" : "#000000";
    const rightColor =
      rightLum !== null && rightLum < 0.5 ? "#ffffff" : "#000000";

    header.style.setProperty("--header-left-color", leftColor);
    header.style.setProperty("--header-right-color", rightColor);
  }, [isOpen]);

  useEffect(() => {
    // 初次與事件更新
    const onScroll = () => {
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(sampleAndApply);
      } else {
        sampleAndApply();
      }
    };
    sampleAndApply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isOpen, sampleAndApply]);

  // 路由變更後，等待下一個 frame 再重新採樣，確保新頁面已完成布局
  useEffect(() => {
    if (typeof window.requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        requestAnimationFrame(sampleAndApply);
      });
    } else {
      setTimeout(sampleAndApply, 0);
    }
  }, [location.pathname, sampleAndApply]);

  const handleProjectClick = () => {
    navigate("/projects");
    setIsOpen(false);
  };

  return (
    <>
      <div
        className={`overlay${isOpen ? " open" : ""}${
          hasOpened ? " has-opened" : ""
        }`}
      >
        {/* 左半邊 - 導航選單 */}
        <div className="menu-section">
          <nav className="navigation">
            <ul>
              <li>
                <Link to="/" onClick={toggleMenu}>
                  HOME
                </Link>
              </li>
              <li>
                <Link to="/projects" onClick={toggleMenu}>
                  WORK
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={toggleMenu}>
                  ABOUT
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={toggleMenu}>
                  CONTACT
                </Link>
              </li>
            </ul>
          </nav>
          <MarqueeText
            textColor="var(--color-accent)"
            lineColor="var(--color-bg)"
          />
        </div>

        {/* 右半邊 - 圖片輪播 */}
        <div className="carousel-section">
          <div className="carousel-container">
            {images.map((image, index) => (
              <div
                key={index}
                className={`carousel-slide ${
                  index === currentImageIndex ? "active" : ""
                }`}
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}
          </div>

          {/* 資訊區塊 */}
          <div className="project-info-panel">
            <div className="info-content">
              <div className="info-text-section">
                <div className="year-section">
                  <div className="info-item">
                    <span className="info-label">Year:</span>
                    <span className="info-value">
                      {projectsData[currentImageIndex]?.year}
                    </span>
                  </div>
                </div>
                <div className="title-section">
                  <div className="info-item">
                    <span className="info-label">Title:</span>
                    <span className="info-value">
                      {projectsData[currentImageIndex]?.title}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="project-button clickable"
                onClick={handleProjectClick}
              >
                <img src={arrowIcon} alt="View Project" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <header ref={headerRef} className="header">
        <button className="menu-icon clickable" onClick={toggleMenu}>
          <span className={isOpen ? "line line1 open" : "line line1"}></span>
          <span className={isOpen ? "line line2 open" : "line line2"}></span>
        </button>
        <div className="logo">YIDA</div>
      </header>
    </>
  );
}
