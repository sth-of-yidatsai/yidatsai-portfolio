import React, { useEffect, useRef, useState } from "react";
import "./CubeGallery.css";
import projects from "../../data/projects.json";
import reloadIcon from "../../assets/icons/replay_48dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg";
import arrowIcon from "../../assets/icons/arrow_outward_48dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg";
import GradientText from "../../reactbits/TextAnimations/GradientText/GradientText";

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
  const [gradientColors, setGradientColors] = useState([
    "#F7F7F7",
    "#E6E6E6",
    "#CCCCCC",
    "#B3B3B3",
    "#999999",
  ]);
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
    if (y >= 45 && y < 135) return "left"; // 修正：改為 left
    if (y >= 135 && y < 225) return "back";
    return "right"; // 修正：改為 right
  }, [angle]);

  // 在控制台顯示當前的 activeFace
  useEffect(() => {
    console.log("當前 activeFace:", activeFace);
  }, [activeFace]);

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

  // 從圖片中提取主要顏色的函數
  const extractColorsFromImage = (imageSrc) => {
    return new Promise((resolve) => {
      console.log("開始提取顏色，圖片路徑:", imageSrc);

      if (!imageSrc) {
        console.log("沒有圖片路徑，使用默認顏色");
        resolve(["#F7F7F7", "#E6E6E6", "#CCCCCC", "#B3B3B3", "#999999"]);
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        console.log("圖片載入成功，尺寸:", img.width, "x", img.height);
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // 設置 canvas 尺寸
          canvas.width = 100;
          canvas.height = 100;

          // 繪製圖片到 canvas
          ctx.drawImage(img, 0, 0, 100, 100);

          // 獲取圖片數據
          const imageData = ctx.getImageData(0, 0, 100, 100);
          const data = imageData.data;

          // 採樣顏色（每10個像素採樣一次）
          const colorMap = new Map();

          for (let i = 0; i < data.length; i += 40) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 跳過透明或接近白色/黑色的像素
            if (r > 250 && g > 250 && b > 250) continue;
            if (r < 5 && g < 5 && b < 5) continue;

            // 計算顏色的飽和度和亮度
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            const brightness = (r + g + b) / 3;

            // 跳過過於飽和或過於暗淡的顏色
            if (saturation < 0.1 || brightness < 30 || brightness > 220)
              continue;

            const color = `#${r.toString(16).padStart(2, "0")}${g
              .toString(16)
              .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

            if (colorMap.has(color)) {
              colorMap.set(color, colorMap.get(color) + 1);
            } else {
              colorMap.set(color, 1);
            }
          }

          console.log("顏色採樣完成，找到", colorMap.size, "種顏色");

          // 選擇出現頻率最高的顏色作為主色
          let mainColor = "#999999"; // 默認顏色
          if (colorMap.size > 0) {
            const sortedColors = Array.from(colorMap.entries()).sort(
              (a, b) => b[1] - a[1]
            );
            mainColor = sortedColors[0][0];
            console.log("主色:", mainColor);
          }

          // 基於主色創建漸層
          const rgb = parseInt(mainColor.slice(1), 16);
          const r = (rgb >> 16) & 255;
          const g = (rgb >> 8) & 255;
          const b = rgb & 255;

          // 創建從深到淺的漸層
          const gradientColors = [
            mainColor, // 主色
            `#${Math.max(0, r - 30)
              .toString(16)
              .padStart(2, "0")}${Math.max(0, g - 30)
              .toString(16)
              .padStart(2, "0")}${Math.max(0, b - 30)
              .toString(16)
              .padStart(2, "0")}`, // 深一點
            `#${Math.min(255, r + 20)
              .toString(16)
              .padStart(2, "0")}${Math.min(255, g + 20)
              .toString(16)
              .padStart(2, "0")}${Math.min(255, b + 20)
              .toString(16)
              .padStart(2, "0")}`, // 淺一點
            `#${Math.min(255, r + 40)
              .toString(16)
              .padStart(2, "0")}${Math.min(255, g + 40)
              .toString(16)
              .padStart(2, "0")}${Math.min(255, b + 40)
              .toString(16)
              .padStart(2, "0")}`, // 更淺
            `#${Math.min(255, r + 60)
              .toString(16)
              .padStart(2, "0")}${Math.min(255, g + 60)
              .toString(16)
              .padStart(2, "0")}${Math.min(255, b + 60)
              .toString(16)
              .padStart(2, "0")}`, // 最淺
          ];

          console.log("生成的漸層顏色:", gradientColors);
          resolve(gradientColors);
        } catch (error) {
          console.warn("Failed to extract colors from image:", error);
          resolve(["#F7F7F7", "#E6E6E6", "#CCCCCC", "#B3B3B3", "#999999"]);
        }
      };

      img.onerror = (error) => {
        console.error("圖片載入失敗:", error);
        console.error("圖片路徑:", imageSrc);
        resolve(["#F7F7F7", "#E6E6E6", "#CCCCCC", "#B3B3B3", "#999999"]);
      };

      img.src = imageSrc;
    });
  };

  // 當 activeFace 改變時，更新漸層顏色
  useEffect(() => {
    const currentMapping = faceMap[activeFace];
    if (currentMapping) {
      const imageSrc = getImageSrc(
        currentMapping.projectId,
        currentMapping.imageIndex
      );
      extractColorsFromImage(imageSrc).then((colors) => {
        setGradientColors(colors);
      });
    }
  }, [activeFace, faceMap]);

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
        <GradientText
          colors={gradientColors}
          animationSpeed={3}
          showBorder={false}
          className="gradient-text"
        >
          ILLUSTRATION
        </GradientText>
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

        {/* Info Panel - Single Row Layout */}
        <div className="cube-info-panel">
          <div className="cube-info-divider-h" />

          <div className="cube-info-row">
            {/* Reload Box */}
            <div className="cube-info-cell reload-cell">
              <div className="cell-label">Reload:</div>
              <button
                className="cube-reload-new"
                onClick={resetAngles}
                aria-label="Reset cube"
              >
                <img src={reloadIcon} alt="Reload" className="reload-icon" />
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="cube-info-divider-v" />

            {/* Title */}
            <div className="cube-info-cell title-cell">
              <div className="cell-label">Title:</div>
              <div className="cell-value title-value">
                {activeProject?.title || "The Notebook Design"}
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="cube-info-divider-v" />

            {/* Year */}
            <div className="cube-info-cell year-cell">
              <div className="cell-label">Year:</div>
              <div className="cell-value year-value">
                {activeProject?.year || "2024"}
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="cube-info-divider-v" />

            {/* Tag */}
            <div className="cube-info-cell tag-cell">
              <div className="cell-label">Tag:</div>
              <div className="tag-list">
                {activeProject?.tags?.map((tag) => (
                  <span key={tag} className="tag-item">
                    {tag}
                  </span>
                )) || [
                  <span key="graphic" className="tag-item">
                    Graphic
                  </span>,
                  <span key="graphic2" className="tag-item">
                    Graphic
                  </span>,
                  <span key="graphic3" className="tag-item">
                    Graphic
                  </span>,
                  <span key="graphic4" className="tag-item">
                    Graphic
                  </span>,
                  <span key="graphic5" className="tag-item">
                    Graphic
                  </span>,
                ]}
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="cube-info-divider-v" />

            {/* View More */}
            <div className="cube-info-cell viewmore-cell">
              <div className="cell-label">Project:</div>
              <a
                className="view-more-link"
                href={activeHref}
                aria-label="View project details"
              >
                <img src={arrowIcon} alt="View More" className="arrow-icon" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
