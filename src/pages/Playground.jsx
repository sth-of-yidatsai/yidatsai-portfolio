import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useNavigate, useParams } from "react-router-dom";
import projectsRaw from "../data/projects.json";
import { buildSrcSet } from "../utils/imgSrcSet";
import { useTranslation } from "../hooks/useTranslation";
import { localizeProject } from "../utils/projectLocale";
import "./Playground.css";

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

// 與 AllWork 相同的尺寸循環 PATTERN（無 size 欄位時自動補上）
const PATTERN = ["landscape", "portrait", "square", "landscape", "portrait", "landscape", "square", "portrait"];

// 各 size 對應的像素尺寸
const SIZE_DIMS = {
  landscape: { width: 480, height: 360 }, // 4:3
  portrait:  { width: 360, height: 480 }, // 3:4
  square:    { width: 360, height: 360 }, // 1:1
};
const DEFAULT_DIMS = { width: 360, height: 480 }; // fallback（同 portrait）

// 依螢幕寬度決定卡片縮放比例
const getDeviceScale = () => {
  const w = window.innerWidth;
  if (w < 480) return 0.58;
  if (w < 768) return 0.70;
  if (w < 1024) return 0.82;
  return 1.0;
};

// Sort descending by order，並補上缺少的 size
let _pi = 0;
const projectsData = [...projectsRaw]
  .sort((a, b) => b.order - a.order)
  .map((p) => (p.size ? p : { ...p, size: PATTERN[_pi++ % PATTERN.length] }));

export default function Playground() {
  const navigate = useNavigate();
  const { lang = 'en' } = useParams();
  const { language, t } = useTranslation();
  const languageRef = useRef(language);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const dragHintRef = useRef(null);
  // 移除標題顯示

  // 設定與狀態
  const settingsRef = useRef({
    itemGap: 72,
    hoverScale: 1.05,
    expandedScale: 0.5,
    dragEase: 0.075,
    momentumFactor: 200,
    bufferZone: 3,
    borderRadius: 0, // 無圓角
    vignetteSize: 0,
    vignetteStrength: 0.7,
    vignettePageSize: 200,
    overlayOpacity: 0.9,
    overlayEaseDuration: 0.8,
    zoomDuration: 0.6,
    offsetY: 320, // 列錯位偏移量
  });

  const stateRef = useRef({
    itemSizes: [],
    itemGap: 72,
    columns: 4,
    cellWidth: 0,
    cellHeight: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    dragVelocityX: 0,
    dragVelocityY: 0,
    lastDragTime: 0,
    mouseHasMoved: false,
    visibleItems: new Set(),
    lastUpdateTime: 0,
    lastX: 0,
    lastY: 0,
    isExpanded: false,
    activeItem: null,
    activeItemId: null,
    canDrag: true,
    originalPosition: null,
    expandedItem: null,
    overlayAnimation: null,
    titleSplit: null,
    rafId: 0,
    titleDelayTween: null,
  });

  // 不再干預游標顯示，交由全站 CustomCursor 負責

  // 初始化 CSS 變數
  const updateCSSVars = () => {
    const settings = settingsRef.current;
    const root = document.documentElement;
    root.style.setProperty("--border-radius", `${settings.borderRadius}px`);
    root.style.setProperty("--vignette-size", `${settings.vignetteSize}px`);
    root.style.setProperty("--hover-scale", settings.hoverScale);
    const strength = settings.vignetteStrength;
    const size = settings.vignettePageSize;
    root.style.setProperty("--page-vignette-size", `${size * 1.5}px`);
    root.style.setProperty(
      "--page-vignette-color",
      `rgba(0,0,0,${strength * 0.7})`
    );
    root.style.setProperty("--page-vignette-strong-size", `${size * 0.75}px`);
    root.style.setProperty(
      "--page-vignette-strong-color",
      `rgba(0,0,0,${strength * 0.85})`
    );
    root.style.setProperty("--page-vignette-extreme-size", `${size * 0.4}px`);
    root.style.setProperty(
      "--page-vignette-extreme-color",
      `rgba(0,0,0,${strength})`
    );
  };

  // 工具
  const getItemId = (col, row) => `${col},${row}`;
  const getItemPosition = (col, row, cellWidth, cellHeight) => {
    const settings = settingsRef.current;
    // 奇數列（column）需要向下偏移，使用正確的模運算處理負數
    const normalizedCol = ((col % 2) + 2) % 2; // 確保負數也能正確計算奇偶性
    const isOddCol = normalizedCol === 1;
    const offsetY = isOddCol ? settings.offsetY : 0;

    return {
      x: col * cellWidth,
      y: row * cellHeight + offsetY,
    };
  };

  const getItemSize = (project) => {
    const scale = getDeviceScale();
    const dims = SIZE_DIMS[project?.size] || DEFAULT_DIMS;
    return {
      width: Math.round(dims.width * scale),
      height: Math.round(dims.height * scale),
    };
  };

  // 已移除標題進場顯示

  const hideTitleImmediately = () => {
    const s = stateRef.current;
    if (s.titleDelayTween) {
      s.titleDelayTween.kill();
      s.titleDelayTween = null;
    }
    // 不再處理 SplitType 與黑底
  };

  // 不再使用漸出動畫（關閉時立即移除）

  const animateOverlayIn = () => {
    const settings = settingsRef.current;
    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.to(overlay, {
      opacity: settings.overlayOpacity,
      duration: settings.overlayEaseDuration,
      ease: "power2.inOut",
    });
    overlay.classList.add("active");
  };

  const animateOverlayOut = () => {
    const settings = settingsRef.current;
    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.to(overlay, {
      opacity: 0,
      duration: settings.overlayEaseDuration,
      ease: "power2.inOut",
    });
    overlay.classList.remove("active");
  };

  // 產生與回收 item
  const updateVisibleItems = () => {
    const settings = settingsRef.current;
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const buffer = settings.bufferZone;
    const viewWidth = window.innerWidth * (1 + buffer);
    const viewHeight = window.innerHeight * (1 + buffer);
    const startCol = Math.floor((-s.currentX - viewWidth / 2) / s.cellWidth);
    const endCol = Math.ceil((-s.currentX + viewWidth * 1.5) / s.cellWidth);
    const startRow = Math.floor((-s.currentY - viewHeight / 2) / s.cellHeight);
    const endRow = Math.ceil((-s.currentY + viewHeight * 1.5) / s.cellHeight);
    const currentItems = new Set();

    // 若沒有任何專案資料，直接返回
    const allItems = projectsData;
    const total = allItems.length;
    if (total === 0) {
      // 清空既有可見元素
      s.visibleItems.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.parentNode === canvas) canvas.removeChild(el);
      });
      s.visibleItems.clear();
      return;
    }

    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        const itemId = getItemId(col, row);
        currentItems.add(itemId);
        if (s.visibleItems.has(itemId)) continue;
        if (s.activeItemId === itemId && s.isExpanded) continue;

        // index 與資料（僅使用 projects.json）
        // 正確的歐幾里得取模，避免 row/col 為負數時索引錯誤
        const rawIndex = row * s.columns + col;
        const idx = ((rawIndex % total) + total) % total;
        const project = allItems[idx];

        const itemSize = getItemSize(project);
        const pos = getItemPosition(col, row, s.cellWidth, s.cellHeight);

        const item = document.createElement("div");
        item.className = "gallery-item clickable";
        item.id = itemId;
        item.style.width = `${itemSize.width}px`;
        // height 不設定，讓 item 自然高度 = 圖片 + caption
        item.style.left = `${pos.x}px`;
        item.style.top = `${pos.y}px`;
        item.dataset.col = String(col);
        item.dataset.row = String(row);
        item.dataset.width = String(itemSize.width);
        item.dataset.height = String(itemSize.height); // 僅圖片高度，用於展開動畫
        const imageUrl = project?.cover === "placeholder.webp"
          ? `/images/projects/placeholder.webp`
          : project?.id && project?.cover
            ? `/images/projects/${project.id}/${project.cover}`
            : "";
        const lp = localizeProject(project, languageRef.current);
        const title = lp?.title || "";
        const projectId = project?.id || "";

        const imageContainer = document.createElement("div");
        imageContainer.className = "gallery-item-image-container";
        imageContainer.style.height = `${itemSize.height}px`; // 圖片區高度 = 指定比例
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = title;
        const srcSet = buildSrcSet(imageUrl);
        if (srcSet) {
          img.srcset = srcSet;
          img.sizes = `${itemSize.width}px`;
        }
        imageContainer.appendChild(img);
        item.appendChild(imageContainer);

        const caption = document.createElement("div");
        caption.className = "gallery-item-caption";
        const nameEl = document.createElement("div");
        nameEl.className = "gallery-item-name";
        nameEl.textContent = title;
        caption.appendChild(nameEl);
        const numberEl = document.createElement("div");
        numberEl.className = "gallery-item-number";
        numberEl.textContent = `(${String(project?.order ?? idx + 1).padStart(3, "0")})`;
        caption.appendChild(numberEl);
        item.appendChild(caption);

        item.addEventListener("click", () => {
          if (s.mouseHasMoved || s.isDragging) return;
          handleItemClick(item, idx, projectId);
        });

        canvas.appendChild(item);
        s.visibleItems.add(itemId);
      }
    }

    // 移除不可見
    s.visibleItems.forEach((id) => {
      if (!currentItems.has(id) || (s.activeItemId === id && s.isExpanded)) {
        const el = document.getElementById(id);
        if (el && el.parentNode === canvas) canvas.removeChild(el);
        s.visibleItems.delete(id);
      }
    });
  };

  const expandItem = (item, itemIndex, projectId) => {
    const settings = settingsRef.current;
    const s = stateRef.current;
    const overlay = overlayRef.current;
    if (!item || !overlay) return;

    s.isExpanded = true;
    s.activeItem = item;
    s.activeItemId = item.id;
    s.canDrag = false;
    if (containerRef.current) containerRef.current.style.cursor = "auto";

    const imgSrc = item.querySelector("img")?.src || "";
    const itemWidth = parseInt(item.dataset.width, 10);
    const itemHeight = parseInt(item.dataset.height, 10);

    // 移除標題顯示

    // 暗場
    animateOverlayIn();

    // 提示文字切換
    if (dragHintRef.current) {
      dragHintRef.current.textContent = t('explore.clickHint');
    }

    // 計算 contain 尺寸（圖片最大顯示範圍，不超出 viewport）
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const imgScale = Math.min(vw / itemWidth, vh / itemHeight);
    const imgDisplayW = Math.round(itemWidth * imgScale);
    const imgDisplayH = Math.round(itemHeight * imgScale);

    // 外層：full viewport，透明，pointer-events:none（只作為 stacking context）
    const expanded = document.createElement("div");
    expanded.className = "gallery-expanded-item";

    // 內層：contain 尺寸，絕對置中，動畫主體
    const inner = document.createElement("div");
    inner.className = "gallery-expanded-inner";

    const img = document.createElement("img");
    img.src = imgSrc;
    const expandedSrcSet = buildSrcSet(imgSrc);
    if (expandedSrcSet) {
      img.srcset = expandedSrcSet;
      img.sizes = "100vw";
    }
    img.classList.add("clickable");
    img.setAttribute("data-clickable", "true");
    inner.appendChild(img);
    expanded.appendChild(inner);

    // 點擊圖片：收尾後導頁
    img.addEventListener("click", () => {
      hideTitleImmediately();
      const overlay = overlayRef.current;
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.2,
          onComplete: () => overlay.classList.remove("active"),
        });
      }
      gsap.to(expanded, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          if (s.expandedItem && s.expandedItem.parentNode) {
            s.expandedItem.parentNode.removeChild(s.expandedItem);
          }
          s.expandedItem = null;
          s.isExpanded = false;
          navigate(`/${lang}/projects/${projectId}`);
        },
      });
    });

    // 將展開節點附加在本頁容器內
    const host =
      containerRef.current ||
      document.getElementById("gallery-canvas") ||
      document.body;
    host.appendChild(expanded);
    s.expandedItem = expanded;

    // 其它卡片淡出
    document.querySelectorAll(".gallery-item").forEach((el) => {
      if (el !== s.activeItem) {
        gsap.to(el, {
          opacity: 0,
          duration: settings.overlayEaseDuration,
          ease: "power2.inOut",
        });
      }
    });

    // 動畫到中央（動畫 inner，outer 固定為 full viewport）
    const rect = item.getBoundingClientRect();
    s.originalPosition = {
      id: item.id,
      rect,
      imgSrc,
      width: itemWidth,
      height: itemHeight,
    };

    gsap.fromTo(
      inner,
      {
        width: itemWidth,
        height: itemHeight,
        x: rect.left,
        y: rect.top,
      },
      {
        width: imgDisplayW,
        height: imgDisplayH,
        x: (vw - imgDisplayW) / 2,
        y: (vh - imgDisplayH) / 2,
        duration: settings.zoomDuration,
        ease: "hop",
      }
    );
  };

  const closeExpandedItem = () => {
    const settings = settingsRef.current;
    const s = stateRef.current;
    if (!s.expandedItem || !s.originalPosition) return;
    // 立即隱藏標題與全版黑底
    hideTitleImmediately();
    animateOverlayOut();

    // 恢復拖曳提示文字
    if (dragHintRef.current) {
      dragHintRef.current.textContent = t('explore.dragHint');
    }

    // 其它卡片淡入
    document.querySelectorAll(".gallery-item").forEach((el) => {
      if (el.id !== s.activeItemId) {
        gsap.to(el, {
          opacity: 1,
          duration: settings.overlayEaseDuration,
          delay: 0.3,
          ease: "power2.inOut",
        });
      }
    });

    const originalRect = s.originalPosition.rect;
    const originalWidth = s.originalPosition.width;
    const originalHeight = s.originalPosition.height;

    const inner = s.expandedItem?.querySelector(".gallery-expanded-inner");
    gsap.to(inner || s.expandedItem, {
      width: originalWidth,
      height: originalHeight,
      x: originalRect.left,
      y: originalRect.top,
      duration: settings.zoomDuration,
      ease: "hop",
      onComplete: () => {
        if (s.expandedItem && s.expandedItem.parentNode) {
          s.expandedItem.parentNode.removeChild(s.expandedItem);
        }
        s.expandedItem = null;
        s.isExpanded = false;
        s.activeItem = null;
        s.originalPosition = null;
        s.activeItemId = null;
        s.canDrag = true;
        if (containerRef.current) containerRef.current.style.cursor = "grab";
        s.dragVelocityX = 0;
        s.dragVelocityY = 0;
      },
    });
  };

  const handleItemClick = (item, itemIndex, projectId) => {
    const s = stateRef.current;
    if (s.isExpanded) {
      if (s.expandedItem) closeExpandedItem();
    } else {
      expandItem(item, itemIndex, projectId);
    }
  };

  const animateLoop = () => {
    const settings = settingsRef.current;
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (s.canDrag) {
      s.currentX += (s.targetX - s.currentX) * settings.dragEase;
      s.currentY += (s.targetY - s.currentY) * settings.dragEase;
      canvas.style.transform = `translate(${s.currentX}px, ${s.currentY}px)`;

      const now = Date.now();
      const distMoved = Math.hypot(s.currentX - s.lastX, s.currentY - s.lastY);
      if (distMoved > 100 || now - s.lastUpdateTime > 120) {
        updateVisibleItems();
        s.lastX = s.currentX;
        s.lastY = s.currentY;
        s.lastUpdateTime = now;
      }
    }
    s.rafId = requestAnimationFrame(animateLoop);
  };

  // 語言切換時重建所有卡片（僅在畫廊已初始化後執行）
  useEffect(() => {
    languageRef.current = language;
    const canvas = canvasRef.current;
    const s = stateRef.current;
    if (!canvas || !s.cellWidth) return; // not yet initialized
    s.visibleItems.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.parentNode === canvas) canvas.removeChild(el);
    });
    s.visibleItems.clear();
    updateVisibleItems();
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  // 初始化與事件綁定
  useEffect(() => {
    updateCSSVars();

    const settings = settingsRef.current;
    const s = stateRef.current;
    s.columns = 4;

    // 依目前螢幕尺寸重新計算格子大小（含縮放比例）
    const initLayoutState = () => {
      const scale = getDeviceScale();
      const gap = Math.round(settings.itemGap * scale);
      const maxCardWidth = Math.round(
        Math.max(...Object.values(SIZE_DIMS).map((d) => d.width), DEFAULT_DIMS.width) * scale
      );
      const maxCardHeight = Math.round(
        Math.max(...Object.values(SIZE_DIMS).map((d) => d.height), DEFAULT_DIMS.height) * scale
      );
      s.cellWidth = maxCardWidth + gap;
      // caption 高度不跟著卡片縮放（文字以 CSS px 渲染，不受 scale 影響），
      // 固定保留 130px 避免多行標題壓到下方卡片
      s.cellHeight = maxCardHeight + 130 + gap;
      settings.offsetY = Math.round(320 * scale);
    };

    initLayoutState();

    // 初次渲染
    updateVisibleItems();
    animateLoop();

    // 本頁：僅隱藏捲軸，不干預自訂游標
    document.body.classList.add("projects-no-scroll");
    document.documentElement.classList.add("projects-no-scroll-html");

    // 監聽 Header 開關（body.menu-open）以切換游標
    // 不監聽 menu-open，避免干預游標

    const onMouseDown = (e) => {
      if (!s.canDrag) return;
      s.isDragging = true;
      s.mouseHasMoved = false;
      s.startX = e.clientX;
      s.startY = e.clientY;
      if (containerRef.current) containerRef.current.style.cursor = "grabbing";
      if (dragHintRef.current) dragHintRef.current.classList.add("is-dragging");
    };
    const onMouseMove = (e) => {
      if (!s.isDragging || !s.canDrag) return;
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) s.mouseHasMoved = true;
      const now = Date.now();
      const dt = Math.max(10, now - s.lastDragTime);
      s.lastDragTime = now;
      s.dragVelocityX = dx / dt;
      s.dragVelocityY = dy / dt;
      s.targetX += dx;
      s.targetY += dy;
      s.startX = e.clientX;
      s.startY = e.clientY;
    };
    const onMouseUp = () => {
      if (!s.isDragging) return;
      s.isDragging = false;
      if (dragHintRef.current) dragHintRef.current.classList.remove("is-dragging");
      if (s.canDrag && containerRef.current) {
        containerRef.current.style.cursor = "grab";
        if (
          Math.abs(s.dragVelocityX) > 0.1 ||
          Math.abs(s.dragVelocityY) > 0.1
        ) {
          s.targetX += s.dragVelocityX * settings.momentumFactor;
          s.targetY += s.dragVelocityY * settings.momentumFactor;
        }
      }
    };
    const onResize = () => {
      if (s.isExpanded && s.expandedItem && s.originalPosition) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const { width: w, height: h } = s.originalPosition;
        const sc = Math.min(vw / w, vh / h);
        const imgDisplayW = Math.round(w * sc);
        const imgDisplayH = Math.round(h * sc);
        const inner = s.expandedItem.querySelector(".gallery-expanded-inner");
        gsap.to(inner || s.expandedItem, {
          width: imgDisplayW,
          height: imgDisplayH,
          x: (vw - imgDisplayW) / 2,
          y: (vh - imgDisplayH) / 2,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        // 重新計算 RWD 縮放後的格子尺寸，清除舊卡片並重繪
        initLayoutState();
        const canvas = canvasRef.current;
        if (canvas) {
          s.visibleItems.forEach((id) => {
            const el = document.getElementById(id);
            if (el && el.parentNode === canvas) canvas.removeChild(el);
          });
          s.visibleItems.clear();
        }
        updateVisibleItems();
      }
    };

    // 觸控事件（行動裝置拖曳）
    const onTouchStart = (e) => {
      if (!s.canDrag) return;
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      s.isDragging = true;
      s.mouseHasMoved = false;
      s.startX = t.clientX;
      s.startY = t.clientY;
      s.lastDragTime = Date.now();
      if (containerRef.current) containerRef.current.style.cursor = "grabbing";
      if (dragHintRef.current) dragHintRef.current.classList.add("is-dragging");
    };
    const onTouchMove = (e) => {
      if (!s.isDragging || !s.canDrag) return;
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      const dx = t.clientX - s.startX;
      const dy = t.clientY - s.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) s.mouseHasMoved = true;
      const now = Date.now();
      const dt = Math.max(10, now - s.lastDragTime);
      s.lastDragTime = now;
      s.dragVelocityX = dx / dt;
      s.dragVelocityY = dy / dt;
      s.targetX += dx;
      s.targetY += dy;
      s.startX = t.clientX;
      s.startY = t.clientY;
      // 阻止瀏覽器原生滾動/回彈
      if (e.cancelable) e.preventDefault();
    };
    const onTouchEnd = () => {
      if (!s.isDragging) return;
      s.isDragging = false;
      if (dragHintRef.current) dragHintRef.current.classList.remove("is-dragging");
      if (s.canDrag && containerRef.current) {
        containerRef.current.style.cursor = "grab";
        if (
          Math.abs(s.dragVelocityX) > 0.1 ||
          Math.abs(s.dragVelocityY) > 0.1
        ) {
          s.targetX += s.dragVelocityX * settings.momentumFactor;
          s.targetY += s.dragVelocityY * settings.momentumFactor;
        }
      }
    };

    const containerEl = containerRef.current;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    // 觸控拖曳監聽
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", onResize);
    if (containerEl) {
      containerEl.addEventListener("mousedown", onMouseDown);
      containerEl.addEventListener("touchstart", onTouchStart, {
        passive: false,
      });
    }

    // 禁用滾動（本頁使用拖曳取代滾動）
    const preventScroll = (e) => {
      e.preventDefault();
    };
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    const overlayEl = overlayRef.current;

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      if (containerEl) {
        containerEl.removeEventListener("mousedown", onMouseDown);
        containerEl.removeEventListener("touchstart", onTouchStart);
      }
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);

      // 清理 rAF 與任何殘留節點（如展開圖）
      if (s.rafId) cancelAnimationFrame(s.rafId);
      if (s.expandedItem && s.expandedItem.parentNode) {
        s.expandedItem.parentNode.removeChild(s.expandedItem);
        s.expandedItem = null;
      }
      if (overlayEl) overlayEl.classList.remove("active");

      // 恢復游標與捲軸狀態
      document.body.classList.remove("hide-cursor", "projects-no-scroll");
      document.documentElement.classList.remove("projects-no-scroll-html");
      // 無需 observer
    };
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="gallery-page">
      <div className="gallery-container" ref={containerRef}>
        <div className="gallery-canvas" id="gallery-canvas" ref={canvasRef} />
        <div
          className="gallery-overlay"
          id="gallery-overlay"
          ref={overlayRef}
          onClick={() => {
            const s = stateRef.current;
            if (s.isExpanded) closeExpandedItem();
          }}
        />
      </div>

      {/* 可選：全頁暈影層（match CodePen 效果） */}
      <div className="gallery-page-vignette-container" aria-hidden>
        <div className="gallery-page-vignette" />
        <div className="gallery-page-vignette-strong" />
        <div className="gallery-page-vignette-extreme" />
      </div>

      <p className="gallery-drag-hint" ref={dragHintRef} aria-hidden>{t('explore.dragHint')}</p>
    </div>
  );
}
