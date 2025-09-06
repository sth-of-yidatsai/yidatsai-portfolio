import React, { useEffect, useRef, useState } from "react";
import "./CubeGallery.css";
import projects from "../../../data/projects.json";
import reloadIcon from "../../../assets/icons/replay_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";
import arrowIcon from "../../../assets/icons/arrow_outward_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";

// ============ Global CSS Color Variables (--700 series) ============
const globalColors700 = {
  "gray-700": "#2d2d2d",
  "sand-700": "#8d7458",
  "clay-700": "#8b6d5e",
  "ochre-700": "#8e7550",
  "slate-700": "#6b7880",
  "mauve-700": "#7a7280",
  "sage-700": "#737c6c",
  "olive-700": "#757257",
  "blush-700": "#8f6f71",
  "linen-700": "#beb3a0",
};

export default function CubeGallery({
  faceMap: faceMapProp,
  initial = { x: -15, y: 25 },
  autoplay = true,
}) {
  const sectionRef = useRef(null);
  const cubeRef = useRef(null);
  const rafRef = useRef(0);
  const draggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [angle, setAngle] = useState({ x: initial.x, y: initial.y });
  const [isResetting, setIsResetting] = useState(false);
  const [illustrationColor, setIllustrationColor] = useState({
    colorName: "gray-700",
    colorValue: "#2d2d2d",
    cssVar: "var(--gray-700)",
  });

  const [animationPhase, setAnimationPhase] = useState("idle"); // 'idle', 'exit', 'enter'
  const [previousProject, setPreviousProject] = useState(null);
  const [displayProject, setDisplayProject] = useState(null); // 用於顯示的項目資訊
  const angleRef = useRef(angle);
  angleRef.current = angle;

  const projectById = React.useMemo(() => {
    const map = new Map();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, []);

  const defaultFaceMap = React.useMemo(
    () => ({
      front: {
        projectId: "project-001",
        imageIndex: 0,
        illustrationColor: "sage-700",
      },
      right: {
        projectId: "project-002",
        imageIndex: 0,
        illustrationColor: "slate-700",
      },
      back: {
        projectId: "project-003",
        imageIndex: 0,
        illustrationColor: "mauve-700",
      },
      left: {
        projectId: "project-004",
        imageIndex: 0,
        illustrationColor: "clay-700",
      },
      top: {
        projectId: "project-001",
        imageIndex: 0,
        illustrationColor: "sage-700",
      },
      bottom: {
        projectId: "project-003",
        imageIndex: 0,
        illustrationColor: "mauve-700",
      },
    }),
    []
  );

  const faceMap = faceMapProp || defaultFaceMap;

  const getImageSrc = React.useCallback(
    (pid, idx) => {
      const p = projectById.get(pid);
      if (!p) {
        console.warn(`Project not found: ${pid}`);
        return "";
      }
      const images = p.projectImages || [];
      const safeIdx = Math.max(0, Math.min(idx || 0, images.length - 1));
      const imageSrc = images[safeIdx] || "";
      if (!imageSrc) {
        console.warn(`No image found for project ${pid} at index ${idx}`);
      }
      return imageSrc;
    },
    [projectById]
  );

  const activeFace = React.useMemo(() => {
    const x = ((angle.x % 360) + 360) % 360;
    const y = ((angle.y % 360) + 360) % 360;
    if (x > 45 && x < 135) return "bottom";
    if (x > 225 && x < 315) return "top";
    if (y >= 315 || y < 45) return "front";
    if (y >= 45 && y < 135) return "left"; // 修正：改為 left
    if (y >= 135 && y < 225) return "back";
    return "right"; // 修正：改為 right
  }, [angle]);

  // 在控制台顯示當前的 activeFace
  useEffect(() => {
    console.log("當前 activeFace:", activeFace);
  }, [activeFace]);

  const activeProject = projectById.get(faceMap[activeFace].projectId);
  const activeHref = displayProject
    ? `https://www.yidatsai.com/project/${displayProject.id}`
    : "#";

  // 處理文字動畫轉場
  useEffect(() => {
    const currentProject = activeProject;
    const currentMapping = faceMap[activeFace];

    if (
      previousProject &&
      currentProject &&
      previousProject.id !== currentProject.id
    ) {
      // 開始動畫序列
      setAnimationPhase("exit");

      // 第一階段：文字向下消失 (需要等待所有元素完成退出動畫)
      // ILLUSTRATION: 12個字母，最後一個字母延遲0.55s開始，動畫持續0.6s = 1.15s
      // Tags: 最後一個tag延遲1.2s開始，動畫持續0.6s = 1.8s
      // 所以需要等待 1.8s 才能確保所有元素都消失
      setTimeout(() => {
        // 在文字完全消失後，更新顏色和項目資訊
        if (currentMapping && currentMapping.illustrationColor) {
          const colorName = currentMapping.illustrationColor;
          setIllustrationColor({
            colorName,
            colorValue: globalColors700[colorName],
            cssVar: `var(--${colorName})`,
          });
        }

        setDisplayProject(currentProject);
        setPreviousProject(currentProject);

        // 第二階段：開始文字動畫 (0.6s)
        setAnimationPhase("enter");

        // 第三階段：完成動畫 (1.2s完成所有字母)
        setTimeout(() => {
          setAnimationPhase("idle");
        }, 1200);
      }, 1800);
    } else {
      // 初次載入或相同項目，不需要動畫
      setPreviousProject(currentProject);
      setDisplayProject(currentProject); // 立即更新顯示項目

      // 初次載入時立即更新顏色
      if (
        !previousProject &&
        currentMapping &&
        currentMapping.illustrationColor
      ) {
        const colorName = currentMapping.illustrationColor;
        setIllustrationColor({
          colorName,
          colorValue: globalColors700[colorName],
          cssVar: `var(--${colorName})`,
        });
      }
    }
  }, [activeProject, previousProject, activeFace, faceMap]);

  useEffect(() => {
    if (!autoplay) return;
    const tick = () => {
      if (!draggingRef.current) {
        setAngle((prevAngle) => {
          let newX = prevAngle.x;
          let newY = prevAngle.y + 0.15;

          // 簡單檢查：如果 X 軸接近正視角度，輕微調整
          const normalizedX = ((newX % 360) + 360) % 360;
          const snapAngles = [0, 90, 180, 270];

          for (const snapAngle of snapAngles) {
            const diff = Math.abs(normalizedX - snapAngle);
            if (diff < 2) {
              // 只在非常接近時（2度內）才調整
              newX += 0.5; // 每次只調整 0.5 度，保持平滑
              break;
            }
          }

          return { x: newX, y: newY };
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [autoplay]);

  // 計算立方體大小和半徑 - 改善響應式
  const getCubeSize = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 根據螢幕尺寸動態調整
    if (vw >= 2560) {
      // 2K+ 螢幕
      return Math.min(vw * 0.32, vh * 0.45, 520);
    } else if (vw >= 1920) {
      // 1080p 螢幕
      return Math.min(vw * 0.35, vh * 0.5, 450);
    } else if (vw >= 1366) {
      // 筆電螢幕
      return Math.min(vw * 0.4, vh * 0.55, 380);
    } else if (vw >= 768) {
      // 平板
      return Math.min(vw * 0.6, vh * 0.45, 320);
    } else {
      // 手機
      return Math.min(vw * 0.8, vh * 0.4, 280);
    }
  };

  const [cubeSize, setCubeSize] = useState(getCubeSize());
  const cubeHalf = cubeSize / 2;

  useEffect(() => {
    const handleResize = () => setCubeSize(getCubeSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube) return;

    const onPointerDown = (e) => {
      // 檢查是否點擊在按鈕或連結上，如果是則不處理
      if (e.target.closest(".cube-reload") || e.target.closest(".meta-link")) {
        return;
      }

      e.preventDefault();
      draggingRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      cube.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };

      setAngle((prevAngle) => ({
        x: prevAngle.x + dy * 0.3,
        y: prevAngle.y + dx * 0.3,
      }));
    };

    const onPointerUp = (e) => {
      draggingRef.current = false;
      cube.releasePointerCapture?.(e.pointerId);
    };

    cube.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      cube.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []); // 移除 cubeSize 依賴，因為事件監聽器不需要重新綁定

  const resetAngles = () => {
    if (isResetting) return; // 防止重複觸發

    setIsResetting(true);

    // 第一階段：縮小並快速旋轉
    const shrinkDuration = 600;
    const expandDuration = 800;

    // 使用 CSS transition 來處理動畫
    const cube = cubeRef.current;
    if (cube) {
      cube.style.transition = `transform ${shrinkDuration}ms ease-in-out, scale ${shrinkDuration}ms ease-in-out`;
      cube.style.scale = "0.1";

      // 快速旋轉到看不見的角度
      setAngle({ x: 360, y: 720 });

      setTimeout(() => {
        // 第二階段：恢復到初始角度並放大
        cube.style.transition = `transform ${expandDuration}ms ease-out, scale ${expandDuration}ms ease-out`;
        cube.style.scale = "1";

        // 簡單的隨機偏移，確保不會完全正視
        const randomX = initial.x + (Math.random() - 0.5) * 8;
        const randomY = initial.y + (Math.random() - 0.5) * 8;
        setAngle({ x: randomX, y: randomY });

        setTimeout(() => {
          // 重置 transition
          cube.style.transition = "transform 80ms linear";
          setIsResetting(false);
        }, expandDuration);
      }, shrinkDuration);
    }
  };

  const faces = [
    {
      key: "front",
      transform: `rotateY(0deg) translateZ(${cubeHalf}px)`,
    },
    {
      key: "back",
      transform: `rotateY(180deg) translateZ(${cubeHalf}px)`,
    },
    {
      key: "right",
      transform: `rotateY(90deg) translateZ(${cubeHalf}px)`,
    },
    {
      key: "left",
      transform: `rotateY(-90deg) translateZ(${cubeHalf}px)`,
    },
    {
      key: "top",
      transform: `rotateX(90deg) translateZ(${cubeHalf}px)`,
    },
    {
      key: "bottom",
      transform: `rotateX(-90deg) translateZ(${cubeHalf}px)`,
    },
  ];

  return (
    <section
      className="cube-gallery"
      ref={sectionRef}
      aria-label="Featured Projects Cube"
    >
      {/* Background ILLUSTRATION TEXT */}
      <div className="cube-illustration-bg">
        <div
          className={`illustration-text ${
            animationPhase !== "idle" ? `animate-${animationPhase}` : ""
          }`}
        >
          {"ILLUSTRATION".split("").map((letter, index) => (
            <span
              key={index}
              className="illustration-letter"
              style={{
                "--letter-delay": `${index * 0.05}s`,
                color: illustrationColor.cssVar,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="cube-main-layout">
        {/* 3D Cube Stage */}
        <div className="cube-stage">
          <div
            ref={cubeRef}
            className="cube"
            style={{
              transform: `rotateX(${angle.x}deg) rotateY(${angle.y}deg)`,
              width: `${cubeSize}px`,
              height: `${cubeSize}px`,
            }}
            data-clickable="true"
          >
            {faces.map((f) => {
              const mapping = faceMap[f.key];
              const src = getImageSrc(
                mapping?.projectId,
                mapping?.imageIndex || 0
              );
              const project = projectById.get(mapping?.projectId);
              return (
                <figure
                  key={f.key}
                  className={`cube-face cube-${f.key} ${
                    activeFace === f.key ? "is-front" : ""
                  }`}
                  style={{
                    transform: f.transform,
                    backgroundImage: src ? `url(${src})` : "none",
                    width: `${cubeSize}px`,
                    height: `${cubeSize}px`,
                  }}
                  aria-label={`${project?.title || ""} (${f.key})`}
                />
              );
            })}
          </div>
        </div>

        {/* Info Panel - Hero Style Layout */}
        <div className="cube-info-panel">
          <div className="cube-info-content">
            {/* Reload Button */}
            <button
              className="cube-nav-button cube-reload-button clickable"
              onClick={resetAngles}
              aria-label="Reset cube"
            >
              <img src={reloadIcon} alt="Reload" />
            </button>

            {/* Title區域 */}
            <div className="cube-title-section">
              <div className="cube-info-item">
                <span className="cube-info-label">Title:</span>
                <span
                  className={`cube-info-value ${
                    animationPhase !== "idle" ? `animate-${animationPhase}` : ""
                  }`}
                >
                  {displayProject?.title || "The Notebook Design"}
                </span>
              </div>
            </div>

            {/* Year區域 */}
            <div className="cube-year-section">
              <div className="cube-info-item">
                <span className="cube-info-label">Year:</span>
                <span
                  className={`cube-info-value ${
                    animationPhase !== "idle" ? `animate-${animationPhase}` : ""
                  }`}
                >
                  {displayProject?.year || "2024"}
                </span>
              </div>
            </div>

            {/* TAG區域 */}
            <div className="cube-tag-section">
              <div className="cube-info-item">
                <span className="cube-info-label">Tag:</span>
                <div
                  className={`cube-tag-list ${
                    animationPhase !== "idle" ? `animate-${animationPhase}` : ""
                  }`}
                >
                  {displayProject?.tags?.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="cube-tag-item"
                      style={{
                        "--animation-delay": `${(index + 1) * 0.05}s`,
                      }}
                    >
                      {tag}
                    </span>
                  )) || [
                    <span
                      key="graphic"
                      className="cube-tag-item"
                      style={{ "--animation-delay": "0.05s" }}
                    >
                      Graphic
                    </span>,
                    <span
                      key="graphic2"
                      className="cube-tag-item"
                      style={{ "--animation-delay": "0.1s" }}
                    >
                      Graphic
                    </span>,
                    <span
                      key="graphic3"
                      className="cube-tag-item"
                      style={{ "--animation-delay": "0.15s" }}
                    >
                      Graphic
                    </span>,
                    <span
                      key="graphic4"
                      className="cube-tag-item"
                      style={{ "--animation-delay": "0.2s" }}
                    >
                      Graphic
                    </span>,
                    <span
                      key="graphic5"
                      className="cube-tag-item"
                      style={{ "--animation-delay": "0.25s" }}
                    >
                      Graphic
                    </span>,
                  ]}
                </div>
              </div>
            </div>

            {/* 前往專案按鈕 */}
            <a
              href={activeHref}
              className="cube-project-button clickable"
              aria-label="View project details"
            >
              <img src={arrowIcon} alt="View Projects" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
