import React, { useEffect, useRef, useCallback, useState } from "react";
import p5 from "p5";
import { useTextAnimation } from "../../../hooks/useTextAnimation";
import { useLoader } from "../../../hooks/use-loader/index.jsx";
import MarqueeText from "../../MarqueeText";
import "./VisionSection.css";

export default function VisionSection({ index }) {
  const layoutRef = useRef(null);
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const colorWheelRef = useRef(null);
  const colorWheelContainerRef = useRef(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const isPickingRef = useRef(false);
  // 取得 knob 的視覺半徑（width/2 + borderWidth）
  const getKnobRadius = () => {
    const el = colorWheelContainerRef.current?.querySelector(".color-knob");
    if (!el) return 9; // fallback：14px 寬 + 2px 邊 = 9px 半徑
    const cs = getComputedStyle(el);
    const w = parseFloat(cs.width) || 14;
    const b = parseFloat(cs.borderWidth) || 0;
    return w / 2 + b;
  };

  // 取得 canvas 在 container 內的偏移量與半徑
  const getOffsets = () => {
    const cvs = colorWheelRef.current;
    const container = colorWheelContainerRef.current;
    if (!cvs || !container)
      return { offX: 0, offY: 0, rCss: 0, rect: null, crect: null };

    const rect = cvs.getBoundingClientRect();
    const crect = container.getBoundingClientRect();
    const offX = rect.left - crect.left; // canvas 左上角相對 container 的位移
    const offY = rect.top - crect.top;
    const rCss = rect.width / 2;
    return { offX, offY, rCss, rect, crect };
  };

  const p5Instance = useRef(null);
  const p5ObserverRef = useRef(null);
  const p5HasInitialized = useRef(false);

  const [pickedColor, setPickedColor] = useState("#fafafa"); // 初始顏色
  const { loading } = useLoader();

  // 文字動畫
  const { textRef } = useTextAnimation({
    delay: 400,
    splitType: "both",
    wordAnimation: {
      from: { opacity: 0, y: 40 },
      to: {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        stagger: 0.06,
      },
    },
    sentenceAnimation: {
      from: { opacity: 0, y: 16 },
      to: {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.15,
      },
      offset: "-=0.25",
    },
  });

  /** 工具：抓 CSS 變數 */
  const getCSSVar = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /** ========== 色環：繪製與取色 ========== */
  // 依版面與視窗高度計算色環尺寸，避免遮到底部跑馬燈
  const getWheelSize = () => {
    const LEFT_PAD = 24 * 2; // .vision-block padding
    const leftPanel = layoutRef.current?.querySelector(".vision-left-panel");
    const infoBlock = leftPanel?.querySelector(".vision-info-block");

    // 左欄寬度限制
    const leftW = (leftPanel?.clientWidth || 360) - LEFT_PAD;

    // 左欄高度（已排除跑馬燈 170px）
    const panelH = leftPanel
      ? leftPanel.clientHeight
      : window.innerHeight - 170;
    const infoH = infoBlock ? infoBlock.clientHeight : 0;

    // 其他保留：分隔線與色碼區、高度緩衝
    const reserve =
      24 /*color 標題行高近似*/ +
      16 /*gap*/ +
      44 /*#hex*/ +
      32; /*divider & 內距緩衝*/

    // 剩餘高度中，色環取「可用高度」的上限
    const maxByPanel = Math.max(140, Math.floor(panelH - infoH - reserve));

    // 也再以視窗高度做一道保險
    const maxByVH = Math.max(
      140,
      Math.floor((window.innerHeight - 170) * 0.32)
    );

    const HARD_CAP = 280; // 鎖最大直徑，避免筆電仍壓到跑馬燈
    return Math.max(140, Math.min(HARD_CAP, leftW, maxByPanel, maxByVH));
  };

  const drawColorWheel = useCallback(() => {
    const cvs = colorWheelRef.current;
    if (!cvs) return;

    const dpr = window.devicePixelRatio || 1;
    const sizeCss = getWheelSize();
    const sizeDev = Math.floor(sizeCss * dpr);
    const rDev = sizeDev / 2;

    // 設定 CSS 尺寸 & 實際像素
    cvs.style.width = `${sizeCss}px`;
    cvs.style.height = `${sizeCss}px`;
    cvs.width = sizeDev;
    cvs.height = sizeDev;

    const ctx = cvs.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 生成色輪
    const img = ctx.createImageData(sizeDev, sizeDev);
    for (let y = 0; y < sizeDev; y++) {
      for (let x = 0; x < sizeDev; x++) {
        const dx = x - rDev,
          dy = y - rDev;
        const dist = Math.hypot(dx, dy);
        const idx = (y * sizeDev + x) * 4;
        if (dist <= rDev) {
          let hue = (Math.atan2(dy, dx) * 180) / Math.PI;
          hue = (hue + 360) % 360;
          const sat = dist / rDev;
          const { r: R, g: G, b: B } = hslToRgb(hue / 360, sat, 0.5);
          img.data[idx] = R;
          img.data[idx + 1] = G;
          img.data[idx + 2] = B;
          img.data[idx + 3] = 255;
        } else {
          img.data[idx + 3] = 0;
        }
      }
    }
    ctx.putImageData(img, 0, 0);

    // —— 重新計算 knob 的視覺位置（轉成 container 座標）——
    const { offX, offY, rCss } = getOffsets();
    const knobR = getKnobRadius();
    const limit = Math.max(1, rCss - knobR);

    if (knobPos.x === 0 && knobPos.y === 0) {
      // 初次放在 0°、半徑 60%（扣掉 knob 半徑）
      const xC = rCss + limit * 0.6;
      const yC = rCss;
      setKnobPos({ x: offX + xC, y: offY + yC });
    } else {
      // 既有 knob：把它轉回 canvas 座標再夾回圓內，最後再加偏移
      const xC = knobPos.x - offX;
      const yC = knobPos.y - offY;
      const dx = xC - rCss,
        dy = yC - rCss;
      const dist = Math.hypot(dx, dy);
      if (dist > limit) {
        const k = limit / dist;
        const nx = rCss + dx * k;
        const ny = rCss + dy * k;
        setKnobPos({ x: offX + nx, y: offY + ny });
      }
    }
  }, [knobPos]);

  // 讀像素 → HEX
  const readHexAt = (x, y) => {
    const cvs = colorWheelRef.current;
    const ctx = cvs.getContext("2d");
    const scale = window.devicePixelRatio || 1;
    const pixel = ctx.getImageData(
      Math.floor(x * scale),
      Math.floor(y * scale),
      1,
      1
    ).data;

    return rgbToHex(pixel[0], pixel[1], pixel[2]);
  };

  // 拖曳/點擊時定位 knob
  const updateColorByPoint = (clientX, clientY) => {
    const cvs = colorWheelRef.current;
    if (!cvs) return;

    // 取得 canvas 與 container 的相對資訊
    const { offX, offY, rCss, rect } = getOffsets();

    // 先換算成「canvas 內部座標」
    let xC = clientX - rect.left;
    let yC = clientY - rect.top;

    // 半徑限制：扣掉 knob 視覺半徑
    const knobR = getKnobRadius();
    const dx = xC - rCss;
    const dy = yC - rCss;
    const dist = Math.hypot(dx, dy);
    const limit = Math.max(1, rCss - knobR);

    if (dist > limit) {
      const k = limit / dist;
      xC = rCss + dx * k;
      yC = rCss + dy * k;
    }

    // 1) 讀色（canvas 座標要乘 DPR）
    const hex = readHexAt(xC, yC);
    setPickedColor(hex);
    if (p5Instance.current?.setTextColor) p5Instance.current.setTextColor(hex);

    // 2) knob 視覺座標：canvas 內部 + canvas 在 container 的偏移
    setKnobPos({ x: offX + xC, y: offY + yC });
  };

  // 取色處理
  const handlePickColor = useCallback((e) => {
    updateColorByPoint(e.clientX, e.clientY);
  }, []);

  const onPointerDown = (e) => {
    isPickingRef.current = true;
    updateColorByPoint(e.clientX, e.clientY);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (isPickingRef.current) updateColorByPoint(e.clientX, e.clientY);
  };
  const onPointerUp = (e) => {
    isPickingRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    drawColorWheel();
    window.addEventListener("resize", drawColorWheel);
    return () => window.removeEventListener("resize", drawColorWheel);
  }, [drawColorWheel]);

  /** ========== p5 初始化 ========== */
  const initializeP5 = () => {
    if (p5HasInitialized.current || !canvasRef.current) return;
    p5HasInitialized.current = true;

    const sketch = (p) => {
      let words = [];
      let gravity;
      let draggedWord = null;
      let dragOffset = { x: 0, y: 0 };
      let primaryColor, secondaryColor;
      let responsiveFontSize;

      const getCanvasSize = () => {
        const host = canvasRef.current;
        const width = host ? host.clientWidth : p.windowWidth;
        const height = window.innerHeight - 170; // 保留跑馬燈高度
        return { width, height };
      };

      const calculateResponsiveFontSize = () => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const breakpoints = {
          mobile: { width: 768, baseSize: 8 },
          tablet: { width: 1024, baseSize: 10 },
          laptop: { width: 1440, baseSize: 12 },
          desktop2k: { width: 2560, baseSize: 22 },
          desktop4k: { width: Infinity, baseSize: 30 },
        };
        let fontSize =
          screenWidth < breakpoints.mobile.width
            ? breakpoints.mobile.baseSize
            : screenWidth < breakpoints.tablet.width
            ? breakpoints.tablet.baseSize
            : screenWidth < breakpoints.laptop.width
            ? breakpoints.laptop.baseSize
            : screenWidth < breakpoints.desktop2k.width
            ? breakpoints.desktop2k.baseSize
            : breakpoints.desktop4k.baseSize;
        const heightFactor = p.constrain(screenHeight / 800, 0.7, 1.3);
        return fontSize * 16 * heightFactor;
      };

      const wordStrings = [
        "C",
        "O",
        "M",
        "P",
        "O",
        "S",
        "E",
        "P",
        "L",
        "A",
        "C",
        "E",
      ];

      p.setup = () => {
        const { width, height } = getCanvasSize();
        const canvas = p.createCanvas(width, height);
        if (canvasRef.current && canvasRef.current.parentNode) {
          canvas.parent(canvasRef.current);
        }

        gravity = p.createVector(0, 0.15);
        primaryColor = getCSSVar("--gray-700");
        secondaryColor = pickedColor || getCSSVar("--gray-300"); // 初始吃當前色

        responsiveFontSize = calculateResponsiveFontSize();

        for (let i = 0; i < wordStrings.length; i++) {
          // ……（排布與延遲邏輯同原程式）……
          const centerX = p.width / 2;
          const horizontalRange = responsiveFontSize * 1.3;
          let x,
            y,
            attempts = 0;
          const maxAttempts = 10;
          do {
            const angle =
              (i / wordStrings.length) * p.TWO_PI + p.random(-0.5, 0.5);
            const radius = p.random(horizontalRange * 0.3, horizontalRange);
            x = centerX + p.cos(angle) * radius;
            const baseVerticalSpacing = responsiveFontSize * 0.4;
            const verticalVariation = p.random(
              -baseVerticalSpacing * 0.3,
              baseVerticalSpacing * 0.3
            );
            y = -100 - i * baseVerticalSpacing + verticalVariation;
            attempts++;
          } while (attempts < maxAttempts);

          const baseDelay = i * 200;
          const delayVariation = p.random(-50, 100);
          const delay = Math.max(0, baseDelay + delayVariation);
          const rotation = p.random(-p.PI / 8, p.PI / 8);

          words.push(
            new Word(
              wordStrings[i],
              x,
              y,
              p,
              secondaryColor,
              delay,
              rotation,
              responsiveFontSize
            )
          );
        }

        // 暴露 API：外部可改所有字色
        p.setTextColor = (cssColor) => {
          words.forEach((w) => (w.color = cssColor));
        };
      };

      p.draw = () => {
        p.background(primaryColor);
        p.blendMode(p.DIFFERENCE);
        for (let w of words) {
          if (w !== draggedWord) w.applyForce(gravity);
          w.update();
          w.checkEdges();
          w.checkCollisions(words);
          w.display();
        }
        p.blendMode(p.BLEND);
      };

      p.mousePressed = () => {
        for (let word of words) {
          if (word.contains(p.mouseX, p.mouseY)) {
            draggedWord = word;
            word.isDragged = true;
            dragOffset.x = p.mouseX - word.position.x;
            dragOffset.y = p.mouseY - word.position.y;
            return;
          }
        }
      };
      p.mouseDragged = () => {
        if (draggedWord) {
          draggedWord.position.x = p.mouseX - dragOffset.x;
          draggedWord.position.y = p.mouseY - dragOffset.y;
          draggedWord.velocity.y = 0;
          draggedWord.vx = 0;
        }
      };
      p.mouseReleased = () => {
        if (draggedWord) {
          draggedWord.isDragged = false;
          draggedWord.vx = (p.mouseX - p.pmouseX) / 10;
          draggedWord.velocity.y = (p.mouseY - p.pmouseY) / 10;
        }
        draggedWord = null;
      };

      p.windowResized = () => {
        const { width, height } = getCanvasSize();
        p.resizeCanvas(width, height);

        const newFont = calculateResponsiveFontSize();
        words.forEach((w) => w.updateFontSize(newFont));
      };

      /** --- Word 類別（內部運動/碰撞/渲染）保持與原檔一致，僅略去 --- */
      class Word {
        constructor(
          text,
          x,
          y,
          p5Instance,
          textColor,
          delay = 0,
          rotation = 0,
          fontSize = null
        ) {
          this.text = text;
          this.p = p5Instance;
          this.position = this.p.createVector(x, y);
          this.velocity = this.p.createVector(0, 0);
          this.acceleration = this.p.createVector(0, 0);
          this.mass = 1;
          this.restitution = 0.4;
          this.friction = 0.97;
          this.damping = 0.97;
          this.maxSpeed = 18;
          this.minSpeed = 0.05;
          this.vx = this.p.random(-0.8, 0.8);
          this.isDragged = false;
          this.delay = delay;
          this.startTime = this.p.millis();
          this.active = false;
          this.rotation = rotation;
          this.rotationSpeed = this.p.random(-0.02, 0.02);
          this.birthTime = this.p.millis();
          this.p.textAlign(this.p.CENTER, this.p.CENTER);
          this.fontSize = fontSize || 20 * 16;
          this.p.textSize(this.fontSize);
          this.width = this.p.textWidth(this.text);
          this.height = this.fontSize;
          this.color = textColor;
        }
        applyForce(force) {
          let f = p5.Vector.div(force, this.mass);
          this.acceleration.add(f);
        }
        update() {
          if (!this.active) {
            if (this.p.millis() - this.startTime > this.delay)
              this.active = true;
            else return;
          }
          if (!this.isDragged) {
            this.velocity.y += 0.15;
            this.position.y += this.velocity.y;
            this.position.x += this.vx;
            let elapsed = (this.p.millis() - this.birthTime) / 1000;
            let slow = this.p.map(elapsed, 0, 5, 1, 0, true);
            this.rotation += this.rotationSpeed * slow;
            this.velocity.y *= this.damping;
            this.vx *= this.damping;
          }
          this.acceleration.mult(0);
        }
        checkEdges() {
          let halfChar = this.fontSize * 0.3;
          const bottom = this.p.height - halfChar;
          if (this.position.y > bottom) {
            this.position.y = bottom;
            this.velocity.y *= -this.restitution;
            this.vx *= this.friction;
          }
          if (this.position.x > this.p.width - halfChar) {
            this.position.x = this.p.width - halfChar;
            this.vx *= -this.restitution;
          } else if (this.position.x < halfChar) {
            this.position.x = halfChar;
            this.vx *= -this.restitution;
          }
          this.velocity.y = this.p.constrain(
            this.velocity.y,
            -this.maxSpeed,
            this.maxSpeed
          );
          this.vx = this.p.constrain(this.vx, -this.maxSpeed, this.maxSpeed);
        }
        checkCollisions(words) {
          for (let other of words) {
            if (other === this) continue;
            const dx = other.position.x - this.position.x;
            const dy = other.position.y - this.position.y;
            const dist = this.p.sqrt(dx * dx + dy * dy);
            const minDist = this.fontSize * 0.68;
            if (dist < minDist && dist > 0) {
              const angle = this.p.atan2(dy, dx);
              const targetX = this.position.x + this.p.cos(angle) * minDist;
              const targetY = this.position.y + this.p.sin(angle) * minDist;
              let ax = (targetX - other.position.x) * 0.06;
              let ay = (targetY - other.position.y) * 0.06;
              const c = (minDist - dist) / minDist;
              ax *= 1 + c;
              ay *= 1 + c;
              if (this.active) {
                this.vx -= ax;
                this.velocity.y -= ay;
              }
              if (other.active) {
                other.vx += ax;
                other.velocity.y += ay;
              }
              if (this.active && other.active) {
                this.position.x -= ax * 1.5;
                this.position.y -= ay * 1.5;
                other.position.x += ax * 1.5;
                other.position.y += ay * 1.5;
              }
            }
          }
        }
        display() {
          this.p.push();
          this.p.translate(this.position.x, this.position.y);
          this.p.rotate(this.rotation);
          this.p.fill(this.color);
          this.p.textAlign(this.p.CENTER, this.p.CENTER);
          this.p.textSize(this.fontSize);
          this.p.textFont(
            "futura-pt, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          );
          this.p.textStyle(this.p.MEDIUM);
          this.p.text(this.text, 0, 0);
          this.p.pop();
        }
        contains(px, py) {
          return (
            px > this.position.x - this.width / 2 &&
            px < this.position.x + this.width / 2 &&
            py > this.position.y - this.height / 2 &&
            py < this.position.y + this.height / 2
          );
        }
        updateFontSize(n) {
          this.fontSize = n;
          this.p.textSize(this.fontSize);
          this.width = this.p.textWidth(this.text);
          this.height = this.fontSize;
        }
      }
    };

    p5Instance.current = new p5(sketch);
  };

  /** 觀察進場後才啟動 p5（沿用原本作法） */
  const setupP5Observer = useCallback(() => {
    if (!sectionRef.current || p5ObserverRef.current) return;
    const options = { threshold: 0.1, rootMargin: "0px 0px -10% 0px" };
    p5ObserverRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !p5HasInitialized.current && !loading) {
          initializeP5();
          p5ObserverRef.current?.unobserve(entry.target);
        }
      });
    }, options);
    p5ObserverRef.current.observe(sectionRef.current);
  }, [loading]);

  const cleanupP5Observer = () => {
    if (p5ObserverRef.current) {
      p5ObserverRef.current.disconnect();
      p5ObserverRef.current = null;
    }
  };

  useEffect(() => {
    if (!loading) {
      setupP5Observer();
      return cleanupP5Observer;
    }
  }, [loading, setupP5Observer]);

  useEffect(() => {
    return () => {
      cleanupP5Observer();
      if (p5Instance.current) {
        try {
          p5Instance.current.remove();
        } catch {
          /* noop */
        } finally {
          p5Instance.current = null;
        }
      }
    };
  }, []);

  return (
    <div
      className={`hs-section vision-section hs-section-${index}`}
      ref={sectionRef}
    >
      {/* 主要版面：左側雙矩形＋右側 p5 畫布 */}
      <div className="vision-layout" ref={layoutRef}>
        <aside className="vision-left-panel">
          <div className="vision-divider-horizontal" />
          {/* 上方：Vision 文案 */}
          <div className="vision-block vision-info-block">
            <div className="vision-block-title">vision</div>
            <div className="vision-text-overlay" ref={textRef}>
              <div className="headline-group">
                <div
                  className="vision-text-overlay-headline"
                  data-animate="words"
                >
                  Observe Nature,
                </div>
                <div
                  className="vision-text-overlay-headline"
                  data-animate="words"
                >
                  Interpret Culture,
                </div>
                <div
                  className="vision-text-overlay-headline"
                  data-animate="words"
                >
                  Compose Place.
                </div>
              </div>
              <div className="subtext-group">
                <div
                  className="vision-text-overlay-subtext"
                  data-animate="words"
                >
                  From nature and culture, I develop a visual lexicon linking
                  local knowledge with contemporary life. Through design, I
                  articulate material histories, typographic rhythm, and
                  editorial structures as pathways to place.
                </div>
              </div>
            </div>
          </div>

          {/* 細線分隔 */}
          <div className="vision-divider-horizontal" />

          {/* 下方：色環挑色器 */}
          <div className="vision-block vision-color-block">
            <div className="vision-block-title">color</div>
            <div className="color-wheel-wrap">
              <div
                className="color-wheel-container"
                ref={colorWheelContainerRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              >
                <canvas
                  ref={colorWheelRef}
                  className="color-wheel"
                  onClick={handlePickColor}
                  aria-label="Pick color for p5 text"
                  data-clickable="true"
                />
                {/* 白色小圓指示器 */}
                <div
                  className="color-knob"
                  style={{ left: `${knobPos.x}px`, top: `${knobPos.y}px` }}
                  aria-hidden
                />
              </div>
              <div className="color-meta">
                <span
                  className="color-chip"
                  style={{ background: pickedColor }}
                />
                <span className="color-hex">{pickedColor}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 垂直分隔線 */}
        <div className="vision-divider-vertical" />

        {/* 右側 p5 畫布容器（寬度依右欄計算） */}
        <div className="vision-canvas-container" ref={canvasRef} />
      </div>

      {/* 底部跑馬燈（位置與樣式維持原樣） */}
      <MarqueeText textColor="var(--gray-300)" lineColor="var(--color-bg)" />
    </div>
  );
}

/** 小工具：HSL→RGB、RGB→HEX */
function hslToRgb(h, s, l) {
  const k = (n) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}
