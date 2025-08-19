import React, { useEffect, useRef } from "react";
import p5 from "p5";
import { useTextAnimation } from "../../hooks/useTextAnimation";
import { useLoader } from "../../hooks/use-loader/index.jsx";
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
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(canvasRef.current);

        gravity = p.createVector(0, 0.1); // 參考 typoTool.js 的重力值

        // 獲取 CSS 變數顏色
        primaryColor = getCSSVariable("--color-primary");
        secondaryColor = getCSSVariable("--color-secondary");

        // 初始化文字對象 - 從畫面頂部集中掉落
        for (let i = 0; i < wordStrings.length; i++) {
          const centerX = p.width / 2;
          const x = p.random(centerX - 300, centerX + 300); // 更集中的水平範圍
          const y = -50 - i * 80; // 減少垂直間距讓文字更密集
          const delay = i * 400; // 減少延遲時間讓文字更快連續掉落
          const rotation = p.random(-p.PI / 6, p.PI / 6); // 減少旋轉角度
          words.push(
            new Word(wordStrings[i], x, y, p, secondaryColor, delay, rotation)
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
        p.resizeCanvas(p.windowWidth, p.windowHeight);
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
          rotation = 0
        ) {
          this.text = text;
          this.p = p5Instance;
          this.position = this.p.createVector(x, y);
          this.velocity = this.p.createVector(0, 0);
          this.acceleration = this.p.createVector(0, 0);
          this.mass = 1; // 標準質量
          this.restitution = 0.5; // 參考 typoTool.js 的彈跳係數
          this.friction = 0.99; // 參考 typoTool.js 的阻尼值
          this.damping = 0.99; // 與 typoTool.js 相同的阻尼
          this.maxSpeed = 20; // 允許更高速度
          this.minSpeed = 0.01; // 降低停止閾值

          // 參考 typoTool.js 添加水平速度和拖動狀態
          this.vx = this.p.random(-1, 1);
          this.isDragged = false;

          // 延遲相關
          this.delay = delay;
          this.startTime = this.p.millis();
          this.active = false;
          this.rotation = rotation; // 初始旋轉角度

          // 參考 typoTool.js 的旋轉系統
          this.rotationSpeed = this.p.random(-0.02, 0.02);
          this.birthTime = this.p.millis();

          // 設定文字樣式來計算尺寸 - Futura Bold 30rem
          this.p.textAlign(this.p.CENTER, this.p.CENTER);
          this.fontSize = 30 * 16; // 30rem 轉換為像素 (假設 1rem = 16px)
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
          // 完全按照 typoTool.js 的邊界檢測
          let halfChar = this.fontSize * 0.4; // typoTool.js: charSize * 0.4

          // typoTool.js 的底部邊界處理
          if (this.position.y > this.p.height - halfChar) {
            this.position.y = this.p.height - halfChar;
            this.velocity.y *= -0.5; // typoTool.js: this.speed *= -0.5;
          }

          // typoTool.js 的左右邊界處理
          if (this.position.x > this.p.width - halfChar) {
            this.position.x = this.p.width - halfChar;
            this.vx *= -1; // typoTool.js: this.vx *= -1;
          } else if (this.position.x < halfChar) {
            this.position.x = halfChar;
            this.vx *= -1; // typoTool.js: this.vx *= -1;
          }
        }

        checkCollisions(words) {
          for (let other of words) {
            if (other !== this) {
              // 參考 typoTool.js 的碰撞檢測
              let dx = other.position.x - this.position.x;
              let dy = other.position.y - this.position.y;
              let distance = this.p.sqrt(dx * dx + dy * dy);
              let minDist = this.fontSize * 0.3; // 減少碰撞距離讓文字更容易交疊

              if (distance < minDist) {
                // 完全按照 typoTool.js 的碰撞處理
                let angle = this.p.atan2(dy, dx);
                let targetX = this.position.x + this.p.cos(angle) * minDist;
                let targetY = this.position.y + this.p.sin(angle) * minDist;
                let ax = (targetX - other.position.x) * 0.01; // 減少分離力度讓文字更容易交疊
                let ay = (targetY - other.position.y) * 0.01;

                // typoTool.js 的速度調整
                this.vx -= ax;
                this.velocity.y -= ay;
                other.vx += ax;
                other.velocity.y += ay;

                // 減少位置分離讓文字更容易交疊
                this.position.x -= ax * 0.5;
                this.position.y -= ay * 0.5;
                other.position.x += ax * 0.5;
                other.position.y += ay * 0.5;
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
      }
    };

    // 創建 p5 實例
    p5Instance.current = new p5(sketch);

    // 清理函數
    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
      }
    };
  }, [loading]);

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
          From nature and culture, I develop a visual lexicon that links local
          knowledge with contemporary life through design, articulating material
          histories, typographic rhythm, and editorial structures as situated
          pathways to place.
        </div>
      </div>
    </div>
  );
}
