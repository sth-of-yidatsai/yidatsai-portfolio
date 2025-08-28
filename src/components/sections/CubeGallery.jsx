import React, { useEffect, useRef, useState } from "react";
import "./CubeGallery.css";
import projects from "../../data/projects.json";
import reloadIcon from "../../assets/icons/replay_48dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg";
import arrowIcon from "../../assets/icons/arrow_outward_48dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg";

// ============ OKLab / OKLCH utilities ============
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const srgbToLinear = (c) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const linearToSrgb = (c) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;

const rgbToOklab = (r, g, b) => {
  // r,g,b: 0~255
  const R = srgbToLinear(r / 255),
    G = srgbToLinear(g / 255),
    B = srgbToLinear(b / 255);
  const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;
  const l_ = Math.cbrt(l),
    m_ = Math.cbrt(m),
    s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  return { L, a, b: b2 };
};

const oklabToRgb = (L, a, b) => {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3,
    m = m_ ** 3,
    s = s_ ** 3;
  let R = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  R = linearToSrgb(R);
  G = linearToSrgb(G);
  B = linearToSrgb(B);
  return {
    r: Math.round(clamp01(R) * 255),
    g: Math.round(clamp01(G) * 255),
    b: Math.round(clamp01(B) * 255),
  };
};

const oklabToOklch = ({ L, a, b }) => {
  const C = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
};
const oklchToOklab = ({ L, C, h }) => {
  const rad = (h * Math.PI) / 180;
  return { L, a: C * Math.cos(rad), b: C * Math.sin(rad) };
};

const rgbToHex = (r, g, b) =>
  `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
    .toString(16)
    .padStart(2, "0")}`;

const oklchToHex = (L, C, h) => {
  const { a, b } = oklchToOklab({ L, C, h });
  const { r, g, b: bb } = oklabToRgb(L, a, b);
  return rgbToHex(r, g, bb);
};

// ============ K-Means in OKLab ============
const kmeansOklab = (points, k = 5, iters = 8) => {
  if (points.length === 0) return [];
  // init by sampling spread
  const centers = [];
  centers.push(points[Math.floor(Math.random() * points.length)]);
  while (centers.length < k) {
    // farthest-point init
    let best = null,
      bestD = -1;
    for (let i = 0; i < 64 && i < points.length; i++) {
      const p = points[Math.floor(Math.random() * points.length)];
      const d = centers.reduce((minD, c) => {
        const dl = p.L - c.L,
          da = p.a - c.a,
          db = p.b - c.b;
        const dist = dl * dl + da * da + db * db;
        return Math.min(minD, dist);
      }, Infinity);
      if (d > bestD) {
        bestD = d;
        best = p;
      }
    }
    centers.push(best || points[Math.floor(Math.random() * points.length)]);
  }

  let labels = new Array(points.length).fill(0);
  for (let t = 0; t < iters; t++) {
    // assign
    for (let i = 0; i < points.length; i++) {
      let bi = 0,
        bd = Infinity;
      for (let c = 0; c < centers.length; c++) {
        const dl = points[i].L - centers[c].L;
        const da = points[i].a - centers[c].a;
        const db = points[i].b - centers[c].b;
        const d = dl * dl + da * da + db * db;
        if (d < bd) {
          bd = d;
          bi = c;
        }
      }
      labels[i] = bi;
    }
    // update
    const sum = centers.map(() => ({ L: 0, a: 0, b: 0, w: 0 }));
    for (let i = 0; i < points.length; i++) {
      const s = sum[labels[i]];
      s.L += points[i].L;
      s.a += points[i].a;
      s.b += points[i].b;
      s.w++;
    }
    for (let c = 0; c < centers.length; c++) {
      if (sum[c].w > 0) {
        centers[c] = {
          L: sum[c].L / sum[c].w,
          a: sum[c].a / sum[c].w,
          b: sum[c].b / sum[c].w,
          w: sum[c].w,
        };
      }
    }
  }
  return centers;
};

// ============ Main: extract palette & gradient ============
const extractHarmonicGradientFromImage = (imageSrc, mode = "monotone") => {
  return new Promise((resolve) => {
    console.log("開始提取和諧色彩，圖片路徑:", imageSrc);

    if (!imageSrc) {
      console.log("沒有圖片路徑，使用默認顏色");
      resolve({
        paletteHex: ["#F7F7F7", "#E6E6E6", "#CCCCCC", "#B3B3B3", "#999999"],
        css: "linear-gradient(135deg, #e6e6e6, #ffffff)",
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";

    img.onload = () => {
      console.log("圖片載入成功，開始 OKLab 色彩分析");
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const S = 64; // 小尺寸抽樣，夠快且代表性高
        canvas.width = S;
        canvas.height = S;
        ctx.drawImage(img, 0, 0, S, S);

        const { data } = ctx.getImageData(0, 0, S, S);

        // 收集樣本：濾掉近白/近黑/近灰，保留一定彩度 & 合理亮度
        const pts = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2],
            a = data[i + 3];
          if (a < 250) continue; // 跳過透明
          if ((r > 245 && g > 245 && b > 245) || (r < 10 && g < 10 && b < 10))
            continue;

          const lab = rgbToOklab(r, g, b);
          const { L, a: A, b: B } = lab;
          const C = Math.hypot(A, B);

          if (L < 0.18 || L > 0.98) continue; // 過暗/過亮
          if (C < 0.02) continue; // 幾乎沒彩度（容易髒）
          pts.push({ ...lab });
        }

        // 如果過濾太狠，放寬條件一次
        if (pts.length < 100) {
          for (let i = 0; i < data.length; i += 8) {
            const r = data[i],
              g = data[i + 1],
              b = data[i + 2],
              a = data[i + 3];
            if (a < 200) continue;
            const lab = rgbToOklab(r, g, b);
            pts.push(lab);
            if (pts.length > 1500) break;
          }
        }

        console.log("OKLab 樣本收集完成，樣本數:", pts.length);

        const clusters = kmeansOklab(pts, 5, 8).map((c) => {
          const lch = oklabToOklch(c);
          return { ...c, ...lch };
        });

        // 以「權重 * C^1.2」挑 accent，避免低彩偏灰
        const accent = clusters.reduce((best, c) => {
          const score = (c.w || 1) * Math.pow(Math.max(0.0001, c.C), 1.2);
          return !best || score > best._score ? { ...c, _score: score } : best;
        }, null) || { L: 0.7, C: 0.08, h: 30 };

        console.log("主色調:", accent);

        // 安全夾取（避免螢幕外色域與髒區）
        const clampL = (L) => Math.min(0.95, Math.max(0.25, L));
        const clampC = (C) => Math.min(0.18, Math.max(0.04, C)); // 建議把 C 控在 0.04~0.18

        const L0 = clampL(accent.L);
        const C0 = clampC(accent.C);
        const H0 = accent.h;

        // 生成 OKLCH 漸層停駐點
        let stops;
        if (mode === "analogous") {
          const H1 = (H0 + 18) % 360;
          stops = [
            { L: clampL(L0 - 0.04), C: clampC(C0 * 0.9), h: H0 },
            { L: L0, C: C0, h: H0 },
            { L: clampL(L0 + 0.08), C: clampC(C0 * 0.85), h: H1 },
          ];
        } else {
          // monotone：單色系，最不易髒
          stops = [
            { L: clampL(L0 - 0.05), C: clampC(C0 * 0.95), h: H0 },
            { L: L0, C: C0, h: H0 },
            { L: clampL(L0 + 0.1), C: clampC(C0 * 0.7), h: H0 },
          ];
        }

        // 同步輸出一組乾淨的 palette（accent + tint/shade）
        const paletteHex = [
          oklchToHex(clampL(L0 - 0.1), clampC(C0 * 0.85), H0),
          oklchToHex(clampL(L0 - 0.04), clampC(C0 * 0.95), H0),
          oklchToHex(L0, C0, H0),
          oklchToHex(clampL(L0 + 0.08), clampC(C0 * 0.8), H0),
          oklchToHex(clampL(L0 + 0.14), clampC(C0 * 0.65), H0),
        ];

        console.log("生成的和諧調色盤:", paletteHex);

        resolve({
          paletteHex,
          css: `linear-gradient(135deg, ${stops
            .map(
              (s) =>
                `oklch(${(s.L * 100).toFixed(1)}% ${s.C.toFixed(
                  3
                )} ${s.h.toFixed(1)})`
            )
            .join(", ")})`,
          accent: { L: L0, C: C0, h: H0 },
          stops,
        });
      } catch (err) {
        console.warn("OKLab 色彩提取失敗:", err);
        resolve({
          paletteHex: ["#F7F7F7", "#E6E6E6", "#CCCCCC", "#B3B3B3", "#999999"],
          css: "linear-gradient(135deg, #e6e6e6, #ffffff)",
        });
      }
    };

    img.onerror = (error) => {
      console.error("圖片載入失敗:", error);
      resolve({
        paletteHex: ["#F7F7F7", "#E6E6E6", "#CCCCCC", "#B3B3B3", "#999999"],
        css: "linear-gradient(135deg, #e6e6e6, #ffffff)",
      });
    };

    img.src = imageSrc;
  });
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
  const [gradientColors, setGradientColors] = useState([
    "#F7F7F7",
    "#E6E6E6",
    "#CCCCCC",
    "#B3B3B3",
    "#999999",
  ]);
  const [animationPhase, setAnimationPhase] = useState("idle"); // 'idle', 'exit', 'enter'
  const [previousProject, setPreviousProject] = useState(null);
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
  const activeHref = activeProject
    ? `https://www.yidatsai.com/project/${activeProject.id}`
    : "#";

  // 處理文字動畫轉場
  useEffect(() => {
    const currentProject = activeProject;

    if (
      previousProject &&
      currentProject &&
      previousProject.id !== currentProject.id
    ) {
      // 開始動畫序列
      setAnimationPhase("exit");

      // 第一階段：文字向下消失 (需要等待所有字母完成退出動畫)
      // ILLUSTRATION 有12個字母，最後一個字母延遲0.6s開始，動畫持續0.6s
      // 所以需要等待 0.6s + 0.6s = 1.2s
      setTimeout(() => {
        // 在文字完全消失後，更新色彩
        const currentMapping = faceMap[activeFace];
        if (currentMapping) {
          const imageSrc = getImageSrc(
            currentMapping.projectId,
            currentMapping.imageIndex
          );
          extractHarmonicGradientFromImage(imageSrc, "monotone").then(
            (result) => {
              setGradientColors(result.paletteHex);
              // 色彩更新完成後，開始文字進場動畫
              setPreviousProject(currentProject);
              setAnimationPhase("enter");

              // 第二階段：文字向上浮起 (同樣需要1.2s完成所有字母)
              setTimeout(() => {
                setAnimationPhase("idle");
              }, 1200);
            }
          );
        } else {
          // 如果沒有映射，直接進入下一階段
          setPreviousProject(currentProject);
          setAnimationPhase("enter");
          setTimeout(() => {
            setAnimationPhase("idle");
          }, 1200);
        }
      }, 1200);
    } else {
      // 初次載入或相同項目，不需要動畫
      setPreviousProject(currentProject);
      // 初次載入時立即更新色彩
      if (!previousProject) {
        const currentMapping = faceMap[activeFace];
        if (currentMapping) {
          const imageSrc = getImageSrc(
            currentMapping.projectId,
            currentMapping.imageIndex
          );
          extractHarmonicGradientFromImage(imageSrc, "monotone").then(
            (result) => {
              setGradientColors(result.paletteHex);
            }
          );
        }
      }
    }
  }, [activeProject, previousProject, activeFace, faceMap, getImageSrc]);

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
                backgroundImage: `linear-gradient(to right, ${gradientColors.join(
                  ", "
                )})`,
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
              <div
                className={`cell-value title-value ${
                  animationPhase !== "idle" ? `animate-${animationPhase}` : ""
                }`}
              >
                {activeProject?.title || "The Notebook Design"}
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="cube-info-divider-v" />

            {/* Year */}
            <div className="cube-info-cell year-cell">
              <div className="cell-label">Year:</div>
              <div
                className={`cell-value year-value ${
                  animationPhase !== "idle" ? `animate-${animationPhase}` : ""
                }`}
              >
                {activeProject?.year || "2024"}
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="cube-info-divider-v" />

            {/* Tag */}
            <div className="cube-info-cell tag-cell">
              <div className="cell-label">Tag:</div>
              <div
                className={`tag-list ${
                  animationPhase !== "idle" ? `animate-${animationPhase}` : ""
                }`}
              >
                {activeProject?.tags?.map((tag, index) => (
                  <span
                    key={tag}
                    className="tag-item"
                    style={{
                      "--animation-delay": `${(index + 1) * 0.05}s`,
                    }}
                  >
                    {tag}
                  </span>
                )) || [
                  <span
                    key="graphic"
                    className="tag-item"
                    style={{ "--animation-delay": "0.05s" }}
                  >
                    Graphic
                  </span>,
                  <span
                    key="graphic2"
                    className="tag-item"
                    style={{ "--animation-delay": "0.1s" }}
                  >
                    Graphic
                  </span>,
                  <span
                    key="graphic3"
                    className="tag-item"
                    style={{ "--animation-delay": "0.15s" }}
                  >
                    Graphic
                  </span>,
                  <span
                    key="graphic4"
                    className="tag-item"
                    style={{ "--animation-delay": "0.2s" }}
                  >
                    Graphic
                  </span>,
                  <span
                    key="graphic5"
                    className="tag-item"
                    style={{ "--animation-delay": "0.25s" }}
                  >
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
