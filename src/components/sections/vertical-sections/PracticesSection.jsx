import React, { useState, useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import "./PracticesSection.css";

// 註冊 GSAP 插件
gsap.registerPlugin(Draggable);

// 六組文字內容
const practiceAreas = [
  {
    id: "graphic",
    title: "GRAPHIC",
    description:
      "Identity and campaign visuals that people recognize and remember. The studio delivers a clear brand guide and ready-to-deploy files for print and digital.",
  },
  {
    id: "editorial",
    title: "EDITORIAL",
    description:
      "Books, catalogues, and reports that make complex content readable—press-ready files and coordinated printer timelines included.",
  },
  {
    id: "ui-ux",
    title: "UI/UX",
    description:
      "Interfaces that clarify content and move people to action—IA, wireframes, and a documented Figma system with developer-ready specs.",
  },
  {
    id: "typography",
    title: "TYPOGRAPHY",
    description:
      "Type that carries your voice across touchpoints—font files, licensing guidance, and specimens for print, web, and UI.",
  },
  {
    id: "motion",
    title: "MOTION",
    description:
      "Motion that explains, guides, and delights—MP4/Lottie/AE packages and usage guidelines for scaling across products.",
  },
  {
    id: "3d-art",
    title: "3D ART",
    description:
      "Photoreal and stylized 3D that tells the material story—stills, loops, and GLB/USDZ assets ready for web, retail, or installation.",
  },
];

// 拖曳項目組件 - 完全按照 CodePen 邏輯
const DraggableItem = ({
  id,
  imageSrc,
  position,
  size,
  zIndex,
  onSelect,
  isSelected,
  canvasRef,
  onBringToFront,
}) => {
  const itemRef = useRef(null);
  const draggableInstance = useRef(null);

  // CodePen 中的阻力常數
  const RESISTANCE_PIXELS = 80;
  const DEFAULT_RESISTANCE = 0.75;
  const END_RESISTANCE = 0;

  // 初始化 GSAP Draggable - 完全按照 CodePen 配置
  useEffect(() => {
    if (itemRef.current && canvasRef.current) {
      // 銷毀舊的實例
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }

      // 設置初始位置
      gsap.set(itemRef.current, {
        x: position.x,
        y: position.y,
        xPercent: -50,
        yPercent: -50,
      });

      // 創建新的 Draggable 實例 - 完全按照 CodePen 的配置
      draggableInstance.current = Draggable.create(itemRef.current, {
        inertia: true,
        allowContextMenu: true,
        allowEventDefault: true,
        type: "x,y",
        dragResistance: DEFAULT_RESISTANCE,
        resistance: 1800,
        bounds: canvasRef.current,

        onDragStart: function () {
          const bounds = this.target.getBoundingClientRect();
          const currentPoint = {
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
          };
          this.__start = currentPoint;
          this.dragResistance = DEFAULT_RESISTANCE;
          this.__unlocked = false;

          onSelect(id);

          // 核心：帶到最上層（唯一遞增的 z）
          const newZ = onBringToFront(id);
          const el = this.target;
          el.setAttribute("data-dragging", "true");
          gsap.set(el, { zIndex: newZ });
        },

        onDrag: function () {
          const { startX, startY, x, y } = this;
          const distance = Math.hypot(x - startX, y - startY);
          const newResistance = gsap.utils.clamp(
            END_RESISTANCE,
            DEFAULT_RESISTANCE,
            gsap.utils.mapRange(
              0,
              RESISTANCE_PIXELS,
              DEFAULT_RESISTANCE,
              END_RESISTANCE
            )(Math.abs(distance))
          );
          if (!this.__unlocked) this.dragResistance = newResistance;
          if (!this.__unlocked && newResistance === END_RESISTANCE) {
            this.__unlocked = true;
          }
          // 不再每幀硬塞 99999，改由上方 newZ 維持堆疊
        },

        onDragEnd: function () {
          this.dragResistance = DEFAULT_RESISTANCE;
          this.__unlocked = false;
          this.target.removeAttribute("data-dragging"); // 放手恢復一般狀態
          // 放手後仍維持 newZ（因為已更新到 React 的 state）
        },

        onThrowComplete: function () {
          this.dragResistance = DEFAULT_RESISTANCE;
          this.__unlocked = false;
          this.target.removeAttribute("data-dragging");
        },
      })[0];
    }

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
    };
  }, [id, onSelect, canvasRef, position, onBringToFront]);

  return (
    <div
      ref={itemRef}
      className={`draggable-item ${isSelected ? "selected" : ""}`}
      data-item-id={id}
      style={{
        width: size?.width || 120,
        height: size?.height || 120,
        zIndex: zIndex || 2,
      }}
    >
      <img src={imageSrc} alt={`Practice item ${id}`} />
    </div>
  );
};

export default function PracticesSection() {
  const [selectedArea, setSelectedArea] = useState(0);
  const [itemPositions, setItemPositions] = useState({});
  const [itemSizes, setItemSizes] = useState({});
  const [itemZIndexes, setItemZIndexes] = useState({});
  const canvasRef = useRef(null);
  const zCounterRef = useRef(10); // 全域 z-index 計數器，起始值隨意 > 初始層級
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  // 計算平均分布位置的函數
  const calculatePositions = useCallback(() => {
    const initialPositions = {};
    const initialSizes = {};
    const initialZIndexes = {};

    // 為每個物件設定不同的尺寸
    const sizeVariations = [
      { width: 140, height: 140 }, // item-01: 中等
      { width: 120, height: 120 }, // item-02: 小
      { width: 160, height: 160 }, // item-03: 大
      { width: 100, height: 100 }, // item-04: 最小
      { width: 150, height: 150 }, // item-05: 中大
      { width: 130, height: 130 }, // item-06: 中小
    ];

    // 計算畫布尺寸（右側區域，扣除左側文字欄位 360px）
    const textAreaWidth = 360; // 左側文字欄位寬度
    const canvasHeight = window.innerHeight; // 畫布高度

    // 響應式網格布局參數
    let cols, rows, padding, itemSpacing;
    let actualTextAreaWidth = textAreaWidth;

    if (window.innerWidth < 768) {
      // 手機：2列3行，文字欄位可能更小或隱藏
      cols = 2;
      rows = 3;
      padding = 40;
      itemSpacing = 30;
      actualTextAreaWidth = Math.min(textAreaWidth, window.innerWidth * 0.3);
    } else if (window.innerWidth < 1024) {
      // 平板：3列2行
      cols = 3;
      rows = 2;
      padding = 60;
      itemSpacing = 40;
      actualTextAreaWidth = Math.min(textAreaWidth, window.innerWidth * 0.4);
    } else {
      // 桌面：3列2行
      cols = 3;
      rows = 2;
      padding = 80;
      itemSpacing = 60;
    }

    // 重新計算畫布寬度
    const actualCanvasWidth = window.innerWidth - actualTextAreaWidth;

    // 計算每個網格單元的大小
    const cellWidth =
      (actualCanvasWidth - padding * 2 - itemSpacing * (cols - 1)) / cols;
    const cellHeight =
      (canvasHeight - padding * 2 - itemSpacing * (rows - 1)) / rows;

    for (let i = 1; i <= 6; i++) {
      const id = `item-${i.toString().padStart(2, "0")}`;

      // 計算網格位置
      const col = (i - 1) % cols;
      const row = Math.floor((i - 1) / cols);

      // 計算中心位置（相對於畫布區域）
      const centerX = padding + col * (cellWidth + itemSpacing) + cellWidth / 2;
      const centerY =
        padding + row * (cellHeight + itemSpacing) + cellHeight / 2;

      // 添加一些隨機偏移，讓布局更自然
      const maxOffset = Math.min(40, cellWidth * 0.2, cellHeight * 0.2);
      const randomOffsetX = (Math.random() - 0.5) * maxOffset;
      const randomOffsetY = (Math.random() - 0.5) * maxOffset;

      initialPositions[id] = {
        x: centerX + randomOffsetX,
        y: centerY + randomOffsetY,
      };

      // 設定個別大小
      initialSizes[id] = sizeVariations[i - 1];
      // 設定初始 z-index (2-7)
      initialZIndexes[id] = i + 1;
    }
    return { initialPositions, initialSizes, initialZIndexes };
  }, []);

  // 初始化項目位置、大小和層級
  useEffect(() => {
    const { initialPositions, initialSizes, initialZIndexes } =
      calculatePositions();
    setItemPositions(initialPositions);
    setItemSizes(initialSizes);
    setItemZIndexes(initialZIndexes);
    // 讓後續 bring-to-front 從最大初始 z-index 起跳
    zCounterRef.current = Math.max(...Object.values(initialZIndexes));
  }, [calculatePositions]);

  // 響應式支持：視窗大小改變時重新計算位置
  useEffect(() => {
    const handleResize = () => {
      const { initialPositions } = calculatePositions();
      setItemPositions(initialPositions);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculatePositions]);

  // 區塊進入畫面時的動畫觸發
  useEffect(() => {
    if (!sectionRef.current) return;

    // 將文字分割成單詞並包裝在 span 中
    const wrapWords = (element) => {
      if (!element) return;

      const text = element.textContent;
      const words = text.split(" ");

      element.innerHTML = words
        .map(
          (word) =>
            `<span class="word-animate" style="display: inline-block; opacity: 0; transform: translateY(40px);">${word}</span>`
        )
        .join(" ");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 觸發初始文字動畫
            if (textRef.current) {
              const titleElement =
                textRef.current.querySelector(".practice-title");
              const descriptionElement = textRef.current.querySelector(
                ".practice-description"
              );

              if (titleElement && descriptionElement) {
                // 包裝文字為單詞
                wrapWords(titleElement);
                wrapWords(descriptionElement);

                // 設定初始狀態
                gsap.set([titleElement, descriptionElement], { opacity: 1 });

                // 執行動畫
                setTimeout(() => {
                  const titleWords =
                    titleElement.querySelectorAll(".word-animate");
                  const descriptionWords =
                    descriptionElement.querySelectorAll(".word-animate");

                  gsap.to([...titleWords, ...descriptionWords], {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "back.out(1.7)",
                    stagger: 0.06,
                  });
                }, 100);
              }
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const bringItemToFront = useCallback((id) => {
    const nextZ = zCounterRef.current + 1;
    zCounterRef.current = nextZ;
    setItemZIndexes((prev) => ({ ...prev, [id]: nextZ }));
    return nextZ; // 回傳給子元件，確保當下也立即套用
  }, []);

  // 文字切換動畫函數
  const animateTextChange = useCallback(() => {
    const titleElement = textRef.current?.querySelector(".practice-title");
    const descriptionElement = textRef.current?.querySelector(
      ".practice-description"
    );

    if (titleElement && descriptionElement) {
      // 將文字分割成單詞並包裝在 span 中
      const wrapWords = (element) => {
        if (!element) return;

        const text = element.textContent;
        const words = text.split(" ");

        element.innerHTML = words
          .map(
            (word) =>
              `<span class="word-animate" style="display: inline-block; opacity: 0; transform: translateY(40px);">${word}</span>`
          )
          .join(" ");
      };

      // 先淡出
      gsap.to([titleElement, descriptionElement], {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          // 重新包裝文字
          wrapWords(titleElement);
          wrapWords(descriptionElement);

          // 設定新內容的初始狀態
          gsap.set([titleElement, descriptionElement], { opacity: 1 });

          // 使用 setTimeout 確保內容更新後再執行動畫
          setTimeout(() => {
            const titleWords = titleElement.querySelectorAll(".word-animate");
            const descriptionWords =
              descriptionElement.querySelectorAll(".word-animate");

            gsap.to([...titleWords, ...descriptionWords], {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "back.out(1.7)",
              stagger: 0.06,
            });
          }, 50);
        },
      });
    }
  }, []);

  const handleItemSelect = useCallback(
    (id) => {
      // 根據 item 尾數對應文字索引 (item-01 -> 0, item-02 -> 1, ...)
      const itemNumber = parseInt(id.split("-")[1]);
      setSelectedArea(itemNumber - 1);
      // 觸發文字切換動畫
      animateTextChange();
    },
    [animateTextChange]
  );

  return (
    <section className="practices-section" ref={sectionRef}>
      <div className="practices-container">
        {/* 左側文字區 */}
        <div className="practices-text-area">
          <h2 className="practices-title">Practice Areas</h2>
          <div className="practices-content" ref={textRef}>
            <div className="practice-area">
              <h3 className="practice-title" data-animate="words">
                {practiceAreas[selectedArea]?.title}
              </h3>
              <p className="practice-description" data-animate="words">
                {practiceAreas[selectedArea]?.description}
              </p>
            </div>
          </div>
          <div className="practices-divider" />
          <div className="practices-current-item">
            <img
              src={`/images/items/item-${(selectedArea + 1)
                .toString()
                .padStart(2, "0")}.png`}
              alt={`Practice item ${selectedArea + 1}`}
            />
          </div>
        </div>

        {/* 右側畫布區 */}
        <div className="practices-canvas-area" ref={canvasRef}>
          {Array.from({ length: 6 }, (_, i) => {
            const id = `item-${(i + 1).toString().padStart(2, "0")}`;
            const imageSrc = `/images/items/${id}.png`;

            return (
              <DraggableItem
                key={id}
                id={id}
                imageSrc={imageSrc}
                position={itemPositions[id] || { x: 100, y: 100 }}
                size={itemSizes[id] || { width: 120, height: 120 }}
                zIndex={itemZIndexes[id] || 2}
                onSelect={handleItemSelect}
                isSelected={selectedArea === i}
                canvasRef={canvasRef}
                onBringToFront={bringItemToFront}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
