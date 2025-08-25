import React, { useEffect, useRef, useState } from "react";
import "./CubeGallery.css";
import projects from "../../data/projects.json";

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
  const angleRef = useRef(angle);
  angleRef.current = angle;

  const projectById = React.useMemo(() => {
    const map = new Map();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, []);

  const defaultFaceMap = React.useMemo(
    () => ({
      front: { projectId: "project-001", imageIndex: 0 },
      right: { projectId: "project-002", imageIndex: 0 },
      back: { projectId: "project-003", imageIndex: 0 },
      left: { projectId: "project-004", imageIndex: 0 },
      top: { projectId: "project-001", imageIndex: 0 },
      bottom: { projectId: "project-003", imageIndex: 0 },
    }),
    []
  );

  const faceMap = faceMapProp || defaultFaceMap;

  const getImageSrc = (pid, idx) => {
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
  };

  const activeFace = React.useMemo(() => {
    const x = ((angle.x % 360) + 360) % 360;
    const y = ((angle.y % 360) + 360) % 360;
    if (x > 45 && x < 135) return "bottom";
    if (x > 225 && x < 315) return "top";
    if (y >= 315 || y < 45) return "front";
    if (y >= 45 && y < 135) return "right";
    if (y >= 135 && y < 225) return "back";
    return "left";
  }, [angle]);

  const activeProject = projectById.get(faceMap[activeFace].projectId);
  const activeHref = activeProject
    ? `https://www.yidatsai.com/project/${activeProject.id}`
    : "#";

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
      <div className="cube-layout">
        <div className="cube-side-left">
          <button
            className="cube-reload"
            onClick={resetAngles}
            aria-label="Reset cube"
          >
            <span className="reload-circle">↻</span>
            <span className="reload-text">RELOAD BOX</span>
          </button>
        </div>
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
        <div className="cube-side-right">
          <div className="meta">
            <h3 className="meta-eyebrow">Creator</h3>
            <div className="meta-line" />
            {activeProject ? (
              <>
                <h2 className="meta-title">{activeProject.title}</h2>
                <div className="meta-sub">
                  <span className="meta-year">{activeProject.year}</span>
                  <span className="dot">•</span>
                  <span className="meta-cat">{activeProject.category}</span>
                </div>
                <div className="meta-tags">
                  {(activeProject.tags || []).map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <a className="meta-link" href={activeHref}>
                  VIEW MORE <span className="arrow">↗</span>
                </a>
              </>
            ) : (
              <p className="meta-empty">—</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
