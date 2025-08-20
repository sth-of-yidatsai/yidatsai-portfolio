import React, { useEffect, useRef } from "react";
import p5 from "p5";
import { useTextAnimation } from "../../hooks/useTextAnimation";
import { useLoader } from "../../hooks/use-loader/index.jsx";
import MarqueeText from "../MarqueeText";
import "./SectionBase.css";

export default function VisionSection({ index }) {
  const canvasRef = useRef(null);
  const p5Instance = useRef(null);
  const { loading } = useLoader();

  // 使用文字動畫 hook
  const { textRef } = useTextAnimation({
    delay: 1000,
    splitType: "both",
    wordAnimation: {
      from: {
        opacity: 0,
        y: 60,
      },
      to: {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
        stagger: 0.1,
      },
    },
    sentenceAnimation: {
      from: {
        opacity: 0,
        y: 20,
      },
      to: {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.2,
      },
      offset: "-=0.3",
    },
  });

  useEffect(() => {
    // 等待loading完成後才初始化p5.js
    if (loading) return;

    // 獲取 CSS 變數值的輔助函數
    const getCSSVariable = (variableName) => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
    };

    // p5.js sketch 函數
    const sketch = (p) => {
      let words = [];
      let gravity;
      let isDragging = false;
      let draggedWord = null;
      let dragOffset = { x: 0, y: 0 };
      let primaryColor, secondaryColor;
      let responsiveFontSize;

      // 計算響應式文字大小的函數
      const calculateResponsiveFontSize = () => {
        const screenWidth = p.windowWidth;
        const screenHeight = p.windowHeight;

        // 定義不同螢幕尺寸的基準值 - 稍微加大
        const breakpoints = {
          // 手機 (< 768px width)
          mobile: { width: 768, baseSize: 6 }, // 從5rem增加到6rem
          // 平板 (768px - 1024px width)
          tablet: { width: 1024, baseSize: 10 }, // 從8rem增加到10rem
          // 筆記本電腦 (1024px - 1440px width)
          laptop: { width: 1440, baseSize: 15 }, // 從12rem增加到15rem
          // 桌上型電腦 2K (1440px - 2560px width)
          desktop2k: { width: 2560, baseSize: 22 }, // 從18rem增加到22rem
          // 桌上型電腦 4K (> 2560px width)
          desktop4k: { width: Infinity, baseSize: 30 }, // 從24rem增加到30rem
        };

        let fontSize;
        if (screenWidth < breakpoints.mobile.width) {
          fontSize = breakpoints.mobile.baseSize;
        } else if (screenWidth < breakpoints.tablet.width) {
          fontSize = breakpoints.tablet.baseSize;
        } else if (screenWidth < breakpoints.laptop.width) {
          fontSize = breakpoints.laptop.baseSize;
        } else if (screenWidth < breakpoints.desktop2k.width) {
          fontSize = breakpoints.desktop2k.baseSize;
        } else {
          fontSize = breakpoints.desktop4k.baseSize;
        }

        // 考慮螢幕高度的調整因子
        const heightFactor = p.constrain(screenHeight / 800, 0.7, 1.3);
        fontSize *= heightFactor;

        // 轉換為像素 (假設 1rem = 16px)
        return fontSize * 16;
      };

      // 文字內容
      const wordStrings = [
        "C",
        "O",
        "M",
        "P",
        "O",
        "S",
        "I",
        "N",
        "G",
        "&",
        "D",
        "E",
        "S",
        "I",
        "G",
        "N",
      ];

      p.setup = () => {
        // 減少 canvas 高度，為底部跑馬燈留出空間
        const canvasHeight = p.windowHeight - 170; // 減去給底部區塊
        const canvas = p.createCanvas(p.windowWidth, canvasHeight);

        // 安全設置canvas的parent
        if (canvasRef.current && canvasRef.current.parentNode) {
          canvas.parent(canvasRef.current);
        }

        gravity = p.createVector(0, 0.15); // 增加重力，加快掉落速度

        // 獲取 CSS 變數顏色
        primaryColor = getCSSVariable("--color-primary");
        secondaryColor = getCSSVariable("--color-secondary");

        // 計算響應式文字大小
        responsiveFontSize = calculateResponsiveFontSize();

        // 初始化文字對象 - 改進分佈避免交疊
        for (let i = 0; i < wordStrings.length; i++) {
          const centerX = p.width / 2;
          // 根據文字大小調整水平範圍
          const horizontalRange = responsiveFontSize * 1.3; // 調整為1.3，平衡分散與聚集

          // 使用更智慧的位置分配
          let x, y;
          let attempts = 0;
          const maxAttempts = 10;

          do {
            // 根據索引創建更均勻的分佈
            const angle =
              (i / wordStrings.length) * p.TWO_PI + p.random(-0.5, 0.5);
            const radius = p.random(horizontalRange * 0.3, horizontalRange);
            x = centerX + p.cos(angle) * radius;

            // 增加垂直間距，避免垂直堆疊
            const baseVerticalSpacing = responsiveFontSize * 0.4; // 從0.25增加到0.4
            const verticalVariation = p.random(
              -baseVerticalSpacing * 0.3,
              baseVerticalSpacing * 0.3
            );
            y = -100 - i * baseVerticalSpacing + verticalVariation; // 起始位置更高

            attempts++;
          } while (attempts < maxAttempts);

          // 減少延遲時間，加快掉落速度
          const baseDelay = i * 200; // 從300減少到200
          const delayVariation = p.random(-50, 100); // 減少隨機變化範圍
          const delay = Math.max(0, baseDelay + delayVariation);

          const rotation = p.random(-p.PI / 8, p.PI / 8); // 進一步減少旋轉角度
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
      };

      p.draw = () => {
        // 使用 CSS 變數的背景顏色
        p.background(primaryColor);

        // 設置 difference 混合模式
        p.blendMode(p.DIFFERENCE);

        for (let word of words) {
          if (word !== draggedWord) {
            word.applyForce(gravity);
          }
          word.update();
          word.checkEdges();
          word.checkCollisions(words);
          word.display();
        }

        // 重置混合模式
        p.blendMode(p.BLEND);
      };

      p.mousePressed = () => {
        for (let word of words) {
          if (word.contains(p.mouseX, p.mouseY)) {
            isDragging = true;
            draggedWord = word;
            word.isDragged = true; // 設置拖動狀態
            dragOffset.x = p.mouseX - word.position.x;
            dragOffset.y = p.mouseY - word.position.y;
            break;
          }
        }
      };

      p.mouseDragged = () => {
        if (isDragging && draggedWord) {
          // 完全按照 typoTool.js 的拖動邏輯
          draggedWord.position.x = p.mouseX - dragOffset.x;
          draggedWord.position.y = p.mouseY - dragOffset.y;
          draggedWord.velocity.y = 0; // typoTool.js: this.speed = 0;
          draggedWord.vx = 0; // typoTool.js: this.vx = 0;
        }
      };

      p.mouseReleased = () => {
        if (isDragging && draggedWord) {
          // 完全按照 typoTool.js 的釋放邏輯
          draggedWord.isDragged = false;
          draggedWord.vx = (p.mouseX - p.pmouseX) / 10;
          draggedWord.velocity.y = (p.mouseY - p.pmouseY) / 10;
        }
        isDragging = false;
        draggedWord = null;
      };

      p.windowResized = () => {
        // 同樣在窗口大小變化時調整canvas高度
        const canvasHeight = p.windowHeight - 170;
        p.resizeCanvas(p.windowWidth, canvasHeight);

        // 重新計算響應式文字大小
        const newFontSize = calculateResponsiveFontSize();

        // 更新所有文字物件的大小
        for (let word of words) {
          word.updateFontSize(newFontSize);
        }

        responsiveFontSize = newFontSize;
      };

      // Word 類別定義
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
          this.mass = 1; // 標準質量
          this.restitution = 0.4; // 增加彈跳效果，從0.3增加到0.4
          this.friction = 0.97; // 減少摩擦力，讓動畫更活潑
          this.damping = 0.97; // 減少阻尼，保持更多動能
          this.maxSpeed = 18; // 增加最大速度，從15增加到18
          this.minSpeed = 0.05; // 保持停止閾值

          // 增加初始水平速度，讓碰撞更明顯
          this.vx = this.p.random(-0.8, 0.8); // 從(-0.5,0.5)增加到(-0.8,0.8)
          this.isDragged = false;

          // 延遲相關
          this.delay = delay;
          this.startTime = this.p.millis();
          this.active = false;
          this.rotation = rotation; // 初始旋轉角度

          // 參考 typoTool.js 的旋轉系統
          this.rotationSpeed = this.p.random(-0.02, 0.02);
          this.birthTime = this.p.millis();

          // 設定文字樣式來計算尺寸 - 使用響應式文字大小
          this.p.textAlign(this.p.CENTER, this.p.CENTER);
          this.fontSize = fontSize || responsiveFontSize || 20 * 16; // 使用傳入的文字大小或預設值
          this.p.textSize(this.fontSize);
          this.width = this.p.textWidth(this.text);
          this.height = this.fontSize;

          // 使用 CSS 變數的文字顏色
          this.color = textColor;
        }

        applyForce(force) {
          let f = p5.Vector.div(force, this.mass);
          this.acceleration.add(f);
        }

        update() {
          // 檢查是否應該開始下落
          if (!this.active) {
            if (this.p.millis() - this.startTime > this.delay) {
              this.active = true;
            } else {
              return; // 還沒到時間，不更新
            }
          }

          // 完全按照 typoTool.js 的運動邏輯
          if (!this.isDragged) {
            // typoTool.js: this.speed += gravity;
            this.velocity.y += gravity.y;
            // typoTool.js: this.y += this.speed; this.x += this.vx;
            this.position.y += this.velocity.y;
            this.position.x += this.vx;

            // typoTool.js 的旋轉邏輯
            let elapsedTime = (this.p.millis() - this.birthTime) / 1000;
            let slowdownFactor = this.p.map(elapsedTime, 0, 5, 1, 0, true);
            this.rotation += this.rotationSpeed * slowdownFactor;

            // typoTool.js: this.speed *= damping; this.vx *= damping;
            this.velocity.y *= this.damping;
            this.vx *= this.damping;
          }

          this.acceleration.mult(0);
        }

        checkEdges() {
          // 修復邊界檢測 - 讓文字可以觸碰到邊緣
          let halfChar = this.fontSize * 0.3; // 減少邊界緩衝區，讓文字更接近邊緣

          // 底部邊界處理 - 確保文字不會掉落到跑馬燈區域
          const bottomLimit = this.p.height - halfChar;
          if (this.position.y > bottomLimit) {
            this.position.y = bottomLimit;
            this.velocity.y *= -this.restitution; // 使用彈跳係數
            this.vx *= this.friction; // 添加水平摩擦力
          }

          // 左右邊界處理 - 讓文字可以觸碰左右邊
          if (this.position.x > this.p.width - halfChar) {
            this.position.x = this.p.width - halfChar;
            this.vx *= -this.restitution; // 使用彈跳係數而不是完全反轉
          } else if (this.position.x < halfChar) {
            this.position.x = halfChar;
            this.vx *= -this.restitution; // 使用彈跳係數而不是完全反轉
          }

          // 限制最大速度
          this.velocity.y = this.p.constrain(
            this.velocity.y,
            -this.maxSpeed,
            this.maxSpeed
          );
          this.vx = this.p.constrain(this.vx, -this.maxSpeed, this.maxSpeed);
        }

        checkCollisions(words) {
          for (let other of words) {
            if (other !== this) {
              // 增強碰撞效果，減少交疊
              let dx = other.position.x - this.position.x;
              let dy = other.position.y - this.position.y;
              let distance = this.p.sqrt(dx * dx + dy * dy);
              // 增加最小距離，進一步減少交疊
              let minDist = this.fontSize * 0.68; // 從0.5增加到0.7

              if (distance < minDist && distance > 0) {
                // 增強分離力和碰撞效果
                let angle = this.p.atan2(dy, dx);
                let targetX = this.position.x + this.p.cos(angle) * minDist;
                let targetY = this.position.y + this.p.sin(angle) * minDist;
                let ax = (targetX - other.position.x) * 0.06; // 從0.05增加到0.08
                let ay = (targetY - other.position.y) * 0.06;

                // 增強碰撞效果
                let collisionForce = (minDist - distance) / minDist;
                ax *= 1 + collisionForce;
                ay *= 1 + collisionForce;

                // 只對活躍的文字應用分離力
                if (this.active) {
                  this.vx -= ax;
                  this.velocity.y -= ay;
                }
                if (other.active) {
                  other.vx += ax;
                  other.velocity.y += ay;
                }

                // 增強位置分離力度
                if (this.active && other.active) {
                  this.position.x -= ax * 1.5; // 從1.0增加到1.5
                  this.position.y -= ay * 1.5;
                  other.position.x += ax * 1.5;
                  other.position.y += ay * 1.5;
                }
              }
            }
          }
        }

        display() {
          // 總是顯示文字，但只有啟動時才會下落
          this.p.push();
          this.p.translate(this.position.x, this.position.y);
          this.p.rotate(this.rotation); // 應用旋轉角度

          this.p.fill(this.color);
          this.p.textAlign(this.p.CENTER, this.p.CENTER);
          this.p.textSize(this.fontSize);

          // 使用 Futura PT 字體
          this.p.textFont(
            "futura-pt, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          );
          this.p.textStyle(this.p.MEDIUM);

          this.p.text(this.text, 0, 0); // 相對於旋轉中心繪製
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

        updateFontSize(newFontSize) {
          this.fontSize = newFontSize;
          // 重新計算文字尺寸
          this.p.textSize(this.fontSize);
          this.width = this.p.textWidth(this.text);
          this.height = this.fontSize;
        }
      }
    };

    // 創建 p5 實例
    p5Instance.current = new p5(sketch);

    // 清理函數
    return () => {
      if (p5Instance.current) {
        try {
          // 先檢查canvas是否還存在於DOM中
          const canvas = p5Instance.current.canvas;
          if (canvas && canvas.parentNode) {
            p5Instance.current.remove();
          }
        } catch (e) {
          console.warn("p5.js cleanup warning:", e);
        } finally {
          p5Instance.current = null;
        }
      }
    };
  }, [loading]);

  // 組件卸載時的清理
  useEffect(() => {
    return () => {
      if (p5Instance.current) {
        try {
          p5Instance.current.remove();
        } catch (e) {
          console.warn("Component unmount p5.js cleanup warning:", e);
        } finally {
          p5Instance.current = null;
        }
      }
    };
  }, []);

  return (
    <div
      className={`hs-section vision-section hs-section-${index} ${
        index > 0 ? "sticky" : ""
      }`}
      style={{
        background: "var(--color-primary)",
        color: "var(--color-secondary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="vision-canvas-container" ref={canvasRef} />

      <div className="vision-text-overlay" ref={textRef}>
        <div className="vision-text-overlay-headline" data-animate="words">
          Composing Place Through Design
        </div>
        <div className="vision-text-overlay-subtext" data-animate="sentences">
          From nature and culture, I develop a visual lexicon linking local
          knowledge with contemporary life. Through design, I articulate
          material histories, typographic rhythm, and editorial structures as
          pathways to place.
        </div>
      </div>

      {/* 底部跑馬燈區塊 */}
      <MarqueeText textColor="var(--color-light)" lineColor="var(--color-bg)" />
    </div>
  );
}
