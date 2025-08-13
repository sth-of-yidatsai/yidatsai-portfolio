import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { useLoaderData, useNavigate } from 'react-router-dom';
import './Projects.css';

gsap.registerPlugin(CustomEase);
CustomEase.create('hop', '0.9, 0, 0.1, 1');

// 僅使用 projects.json 的第一張圖作為封面顯示

export default function Projects() {
  const loaderData = useLoaderData();
  const projectsData = Array.isArray(loaderData) ? loaderData : [];
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  // 移除標題顯示

  // 設定與狀態
  const settingsRef = useRef({
    baseWidth: 400,
    smallHeight: 330,
    largeHeight: 500,
    itemGap: 65,
    hoverScale: 1.05,
    expandedScale: 0.5,
    dragEase: 0.075,
    momentumFactor: 200,
    bufferZone: 3,
    borderRadius: 0,
    vignetteSize: 0,
    vignetteStrength: 0.7,
    vignettePageSize: 200,
    overlayOpacity: 0.9,
    overlayEaseDuration: 0.8,
    zoomDuration: 0.6,
  });

  const stateRef = useRef({
    itemSizes: [],
    itemGap: 65,
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

  // 專案排序：以 id 內的數字降冪（號碼越大越新）
  const parseProjectOrder = (id) => {
    if (typeof id !== 'string') return 0;
    const m = id.match(/(\d+)/g);
    if (!m || !m.length) return 0;
    // 取最後一段數字以避免 id 中有其他數字
    return parseInt(m[m.length - 1], 10) || 0;
  };

  const getSortedProjects = () => {
    const arr = Array.isArray(projectsData) ? [...projectsData] : [];
    arr.sort((a, b) => parseProjectOrder(b?.id) - parseProjectOrder(a?.id));
    return arr;
  };

  // 從圖片網址提取專案編號字串（保留前導零），如 "project-003" → "003"
  const extractNumberFromImageUrl = (url) => {
    if (typeof url !== 'string') return null;
    const m = url.match(/project[-_](\d+)/i);
    return m && m[1] ? m[1] : null;
  };

  // 不再干預游標顯示，交由全站 CustomCursor 負責

  // 初始化 CSS 變數
  const updateCSSVars = () => {
    const settings = settingsRef.current;
    const root = document.documentElement;
    root.style.setProperty('--border-radius', `${settings.borderRadius}px`);
    root.style.setProperty('--vignette-size', `${settings.vignetteSize}px`);
    root.style.setProperty('--hover-scale', settings.hoverScale);
    const strength = settings.vignetteStrength;
    const size = settings.vignettePageSize;
    root.style.setProperty('--page-vignette-size', `${size * 1.5}px`);
    root.style.setProperty('--page-vignette-color', `rgba(0,0,0,${strength * 0.7})`);
    root.style.setProperty('--page-vignette-strong-size', `${size * 0.75}px`);
    root.style.setProperty('--page-vignette-strong-color', `rgba(0,0,0,${strength * 0.85})`);
    root.style.setProperty('--page-vignette-extreme-size', `${size * 0.4}px`);
    root.style.setProperty('--page-vignette-extreme-color', `rgba(0,0,0,${strength})`);
  };

  // 工具
  const getItemId = (col, row) => `${col},${row}`;
  const getItemPosition = (col, row, cellWidth, cellHeight) => ({ x: col * cellWidth, y: row * cellHeight });

  const getItemSize = (row, col) => {
    const { itemSizes, columns } = stateRef.current;
    const sizeIndex = Math.abs(((row * columns + col) % itemSizes.length));
    return itemSizes[sizeIndex];
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
    gsap.to(overlay, { opacity: settings.overlayOpacity, duration: settings.overlayEaseDuration, ease: 'power2.inOut' });
    overlay.classList.add('active');
  };

  const animateOverlayOut = () => {
    const settings = settingsRef.current;
    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.to(overlay, { opacity: 0, duration: settings.overlayEaseDuration, ease: 'power2.inOut' });
    overlay.classList.remove('active');
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
    const allItems = getSortedProjects();
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

    // 依目前資料 id 中數字段的最大位數決定顯示位數（例如 project-003 → 3 位數）
    const computePadLen = (items) => {
      let maxLen = 1;
      for (let i = 0; i < items.length; i += 1) {
        const idStr = items[i]?.id;
        if (typeof idStr === 'string') {
          const m = idStr.match(/(\d+)/g);
          if (m && m.length) {
            const seg = m[m.length - 1];
            maxLen = Math.max(maxLen, seg.length);
          }
        }
      }
      return maxLen;
    };
    const padLen = computePadLen(allItems);

    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        const itemId = getItemId(col, row);
        currentItems.add(itemId);
        if (s.visibleItems.has(itemId)) continue;
        if (s.activeItemId === itemId && s.isExpanded) continue;

        const itemSize = getItemSize(row, col);
        const pos = getItemPosition(col, row, s.cellWidth, s.cellHeight);

        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.id = itemId;
        item.style.width = `${itemSize.width}px`;
        item.style.height = `${itemSize.height}px`;
        item.style.left = `${pos.x}px`;
        item.style.top = `${pos.y}px`;
        item.dataset.col = String(col);
        item.dataset.row = String(row);
        item.dataset.width = String(itemSize.width);
        item.dataset.height = String(itemSize.height);

        // index 與資料（僅使用 projects.json）
        // 正確的歐幾里得取模，避免 row/col 為負數時索引錯誤
        const rawIndex = (row * s.columns + col);
        const idx = ((rawIndex % total) + total) % total;
        const project = allItems[idx];
        const imageUrl = project?.projectImages?.[0] || '';
        const title = project?.title || '';
        const projectId = project?.id || '';

        const imageContainer = document.createElement('div');
        imageContainer.className = 'gallery-item-image-container';
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = title;
        imageContainer.appendChild(img);
        item.appendChild(imageContainer);

        const caption = document.createElement('div');
        caption.className = 'gallery-item-caption';
        const nameEl = document.createElement('div');
        nameEl.className = 'gallery-item-name';
        nameEl.textContent = title;
        caption.appendChild(nameEl);
        const numberEl = document.createElement('div');
        numberEl.className = 'gallery-item-number';
        // 依圖片網址中的資料夾/檔名提取編號，優先使用該編號（保留前導零）
        const urlNumber = extractNumberFromImageUrl(imageUrl);
        if (urlNumber) {
          numberEl.textContent = `#${urlNumber}`;
        } else {
          // 後備：使用 id 的數字長度進行補零，或以位置序號
          const fallbackNumber = idx + 1;
          numberEl.textContent = `#${String(fallbackNumber).padStart(padLen, '0')}`;
        }
        caption.appendChild(numberEl);
        item.appendChild(caption);

        item.addEventListener('click', () => {
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
    if (containerRef.current) containerRef.current.style.cursor = 'auto';

    const imgSrc = item.querySelector('img')?.src || '';
    const itemWidth = parseInt(item.dataset.width, 10);
    const itemHeight = parseInt(item.dataset.height, 10);

    // 移除標題顯示

    // 暗場
    animateOverlayIn();

    // 建立展開元件
    const expanded = document.createElement('div');
    expanded.className = 'gallery-expanded-item';
    expanded.style.width = `${itemWidth}px`;
    expanded.style.height = `${itemHeight}px`;
    const img = document.createElement('img');
    img.src = imgSrc;
    expanded.appendChild(img);
    // 點擊展開圖：先確保收尾（overlay 與節點移除）再導頁，避免殘留
    expanded.addEventListener('click', () => {
      hideTitleImmediately();
      const overlay = overlayRef.current;
      if (overlay) {
        gsap.to(overlay, { opacity: 0, duration: 0.2, onComplete: () => overlay.classList.remove('active') });
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
          navigate(`/project/${projectId}`);
        },
      });
    });
    // 將展開節點附加在本頁容器內，避免脫離 #root 後建立更高層的堆疊上下文
    const host = containerRef.current || document.getElementById('gallery-canvas') || document.body;
    host.appendChild(expanded);
    s.expandedItem = expanded;

    // 其它卡片淡出
    document.querySelectorAll('.gallery-item').forEach((el) => {
      if (el !== s.activeItem) {
        gsap.to(el, { opacity: 0, duration: settings.overlayEaseDuration, ease: 'power2.inOut' });
      }
    });

    // 動畫到中央
    const rect = item.getBoundingClientRect();
    s.originalPosition = {
      id: item.id,
      rect,
      imgSrc,
      width: itemWidth,
      height: itemHeight,
    };

    const viewportWidth = window.innerWidth;
    const targetWidth = viewportWidth * settings.expandedScale;
    const aspectRatio = itemHeight / itemWidth;
    const targetHeight = targetWidth * aspectRatio;

    gsap.fromTo(
      expanded,
      {
        width: itemWidth,
        height: itemHeight,
        x: rect.left + itemWidth / 2 - window.innerWidth / 2,
        y: rect.top + itemHeight / 2 - window.innerHeight / 2,
      },
      {
        width: targetWidth,
        height: targetHeight,
        x: 0,
        y: 0,
        duration: settings.zoomDuration,
        ease: 'hop',
      },
    );
  };

  const closeExpandedItem = () => {
    const settings = settingsRef.current;
    const s = stateRef.current;
    if (!s.expandedItem || !s.originalPosition) return;
    // 立即隱藏標題與全版黑底
    hideTitleImmediately();
    animateOverlayOut();

    // 其它卡片淡入
    document.querySelectorAll('.gallery-item').forEach((el) => {
      if (el.id !== s.activeItemId) {
        gsap.to(el, { opacity: 1, duration: settings.overlayEaseDuration, delay: 0.3, ease: 'power2.inOut' });
      }
    });

    const originalRect = s.originalPosition.rect;
    const originalWidth = s.originalPosition.width;
    const originalHeight = s.originalPosition.height;

    gsap.to(s.expandedItem, {
      width: originalWidth,
      height: originalHeight,
      x: originalRect.left + originalWidth / 2 - window.innerWidth / 2,
      y: originalRect.top + originalHeight / 2 - window.innerHeight / 2,
      duration: settings.zoomDuration,
      ease: 'hop',
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
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
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

  // 初始化與事件綁定
  useEffect(() => {
    updateCSSVars();

    const settings = settingsRef.current;
    const s = stateRef.current;
    s.itemSizes = [
      { width: settings.baseWidth, height: settings.smallHeight },
      { width: settings.baseWidth, height: settings.largeHeight },
    ];
    s.itemGap = settings.itemGap;
    s.columns = 4;
    s.cellWidth = settings.baseWidth + settings.itemGap;
    s.cellHeight = Math.max(settings.smallHeight, settings.largeHeight) + settings.itemGap;

    // 初次渲染
    updateVisibleItems();
    animateLoop();

    // 本頁：僅隱藏捲軸，不干預自訂游標
    document.body.classList.add('projects-no-scroll');
    document.documentElement.classList.add('projects-no-scroll-html');

    // 監聽 Header 開關（body.menu-open）以切換游標
    // 不監聽 menu-open，避免干預游標

    const onMouseDown = (e) => {
      if (!s.canDrag) return;
      s.isDragging = true;
      s.mouseHasMoved = false;
      s.startX = e.clientX;
      s.startY = e.clientY;
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
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
      if (s.canDrag && containerRef.current) {
        containerRef.current.style.cursor = 'grab';
        if (Math.abs(s.dragVelocityX) > 0.1 || Math.abs(s.dragVelocityY) > 0.1) {
          s.targetX += s.dragVelocityX * settings.momentumFactor;
          s.targetY += s.dragVelocityY * settings.momentumFactor;
        }
      }
    };
    const onResize = () => {
      if (s.isExpanded && s.expandedItem && s.originalPosition) {
        const viewportWidth = window.innerWidth;
        const targetWidth = viewportWidth * settings.expandedScale;
        const aspectRatio = s.originalPosition.height / s.originalPosition.width;
        const targetHeight = targetWidth * aspectRatio;
        gsap.to(s.expandedItem, { width: targetWidth, height: targetHeight, duration: 0.3, ease: 'power2.out' });
      } else {
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
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
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
      if (s.canDrag && containerRef.current) {
        containerRef.current.style.cursor = 'grab';
        if (Math.abs(s.dragVelocityX) > 0.1 || Math.abs(s.dragVelocityY) > 0.1) {
          s.targetX += s.dragVelocityX * settings.momentumFactor;
          s.targetY += s.dragVelocityY * settings.momentumFactor;
        }
      }
    };

    const containerEl = containerRef.current;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    // 觸控拖曳監聽
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onResize);
    if (containerEl) {
      containerEl.addEventListener('mousedown', onMouseDown);
      containerEl.addEventListener('touchstart', onTouchStart, { passive: false });
    }

    // 禁用滾動（本頁使用拖曳取代滾動）
    const preventScroll = (e) => {
      e.preventDefault();
    };
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    const overlayEl = overlayRef.current;

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      if (containerEl) {
        containerEl.removeEventListener('mousedown', onMouseDown);
        containerEl.removeEventListener('touchstart', onTouchStart);
      }
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);

      // 清理 rAF 與任何殘留節點（如展開圖）
      if (s.rafId) cancelAnimationFrame(s.rafId);
      if (s.expandedItem && s.expandedItem.parentNode) {
        s.expandedItem.parentNode.removeChild(s.expandedItem);
        s.expandedItem = null;
      }
      if (overlayEl) overlayEl.classList.remove('active');

      // 恢復游標與捲軸狀態
      document.body.classList.remove('hide-cursor', 'projects-no-scroll');
      document.documentElement.classList.remove('projects-no-scroll-html');
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
    </div>
  );
}


