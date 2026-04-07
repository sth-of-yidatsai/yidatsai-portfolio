import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import p5 from 'p5';
import arrowCircleLeft from '../assets/icons/arrow-circle-left.svg';
import './NotFound.css';

/* ── colour-wheel utils ── */
function hslToRgb(h, s, l) {
  const k = (n) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) };
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/* ── Draggable OS-style window ── */
function DraggableWindow({ title, children, initialX, initialY, zIndex, onFocus, onClose, onDragMove, visible = true }) {
  const posRef = useRef({ x: initialX, y: initialY });
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const onPointerDown = (e) => {
    if (e.target.closest('.nf-win-close')) return;
    onFocus?.();
    isDragging.current = true;
    dragStart.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    const next = { x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y };
    const dx = next.x - posRef.current.x;
    const dy = next.y - posRef.current.y;
    posRef.current = next;
    setPos(next);
    onDragMove?.(dx, dy);
  };
  const onPointerUp = (e) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className="nf-window" style={{ left: pos.x, top: pos.y, zIndex, display: visible ? undefined : 'none' }}>
      <div
        className="nf-win-titlebar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <span className="nf-win-title">{title}</span>
        <button className="nf-win-close" aria-label="close" onClick={onClose}>×</button>
      </div>
      {children}
    </div>
  );
}

/* ── Main page ── */
export default function NotFound() {
  /* window visibility */
  const [showP5, setShowP5] = useState(true);
  const [showColor, setShowColor] = useState(true);

  /* z-index focus management */
  const [topWindow, setTopWindow] = useState('color'); // color picker starts on top

  /* initial positions — colour picker overlaps 404 window by ~120 px on the right */
  const p5X = Math.round(window.innerWidth * 0.34);
  const isLarge = window.innerWidth >= 1440;
  const p5Y = isLarge ? 128 : 64; // --space-2xl on large, --space-xl otherwise
  const colorX = Math.max(20, p5X - 210);          // right edge = p5X + 120
  const colorY = Math.round(window.innerHeight * (isLarge ? 0.52 : 0.44));

  /* p5 */
  const canvasHostRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const p5InitRef = useRef(false);

  /* colour wheel */
  const wheelCanvasRef = useRef(null);
  const wheelContainerRef = useRef(null);
  const isPickingRef = useRef(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [pickedColor, setPickedColor] = useState('#ffffff');

  /* ── draw colour wheel pixels (once) ── */
  const drawWheelPixels = useCallback(() => {
    const cvs = wheelCanvasRef.current;
    if (!cvs) return;
    const dpr = window.devicePixelRatio || 1;
    const SIZE = 290;
    const sizeDev = Math.floor(SIZE * dpr);
    const rDev = sizeDev / 2;
    cvs.style.width = `${SIZE}px`;
    cvs.style.height = `${SIZE}px`;
    cvs.width = sizeDev;
    cvs.height = sizeDev;

    const ctx = cvs.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const img = ctx.createImageData(sizeDev, sizeDev);
    for (let y = 0; y < sizeDev; y++) {
      for (let x = 0; x < sizeDev; x++) {
        const dx = x - rDev, dy = y - rDev;
        const dist = Math.hypot(dx, dy);
        const idx = (y * sizeDev + x) * 4;
        if (dist <= rDev) {
          let hue = (Math.atan2(dy, dx) * 180) / Math.PI;
          hue = (hue + 360) % 360;
          const sat = dist / rDev;
          const l = 1 - sat * 0.5; // center=white (L=1), edge=full chroma (L=0.5)
          const { r: R, g: G, b: B } = hslToRgb(hue / 360, sat, l);
          img.data[idx] = R; img.data[idx + 1] = G; img.data[idx + 2] = B; img.data[idx + 3] = 255;
        } else {
          img.data[idx + 3] = 0;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, []);

  /* ── get canvas → container offset for knob positioning ── */
  const getOffsets = () => {
    const cvs = wheelCanvasRef.current;
    const container = wheelContainerRef.current;
    if (!cvs || !container) return { offX: 0, offY: 0, rCss: 0, rect: null };
    const rect = cvs.getBoundingClientRect();
    const crect = container.getBoundingClientRect();
    return {
      offX: rect.left - crect.left,
      offY: rect.top - crect.top,
      rCss: rect.width / 2,
      rect,
    };
  };

  /* read pixel colour as hex */
  const readHexAt = (xCss, yCss) => {
    const cvs = wheelCanvasRef.current;
    const ctx = cvs.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const px = ctx.getImageData(Math.floor(xCss * dpr), Math.floor(yCss * dpr), 1, 1).data;
    return rgbToHex(px[0], px[1], px[2]);
  };

  /* update knob + picked colour from pointer position */
  const updateColor = (clientX, clientY) => {
    const { offX, offY, rCss, rect } = getOffsets();
    if (!rect) return;
    let xC = clientX - rect.left;
    let yC = clientY - rect.top;
    const KNOB_R = 9;
    const dx = xC - rCss, dy = yC - rCss;
    const dist = Math.hypot(dx, dy);
    const limit = Math.max(1, rCss - KNOB_R);
    if (dist > limit) {
      const k = limit / dist;
      xC = rCss + dx * k;
      yC = rCss + dy * k;
    }
    const hex = readHexAt(xC, yC);
    setPickedColor(hex);
    setKnobPos({ x: offX + xC, y: offY + yC });
    if (p5InstanceRef.current?.setTextColor) p5InstanceRef.current.setTextColor(hex);
  };

  const onWheelDown = (e) => {
    isPickingRef.current = true;
    updateColor(e.clientX, e.clientY);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onWheelMove = (e) => { if (isPickingRef.current) updateColor(e.clientX, e.clientY); };
  const onWheelUp = (e) => {
    isPickingRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  /* draw wheel + set initial knob on mount */
  useEffect(() => {
    drawWheelPixels();
    requestAnimationFrame(() => {
      const { offX, offY, rCss } = getOffsets();
      // knob starts at wheel centre → white (#ffffff)
      setKnobPos({ x: offX + rCss, y: offY + rCss });
    });
  }, [drawWheelPixels]);

  /* ── init p5 on mount ── */
  useEffect(() => {
    if (p5InitRef.current || !canvasHostRef.current) return;
    p5InitRef.current = true;

    const LETTERS = ['4', '0', '4', 'P', 'a', 'g', 'e', 'N', 'o', 't', 'F', 'o', 'u', 'n', 'd'];

    const sketch = (p) => {
      let words = [];
      let dragged = null;
      let dragOff = { x: 0, y: 0 };

      p.setup = () => {
        const host = canvasHostRef.current;
        const w = host ? host.clientWidth : 800;
        const h = host ? host.clientHeight : 500;
        const canvas = p.createCanvas(w, h);
        canvas.parent(canvasHostRef.current);

        // larger letters — no hard cap so big screens get big text
        const fontSize = Math.min(w * 0.2, h * 0.34);

        LETTERS.forEach((ch, i) => {
          const x = p.random(fontSize * 0.7, w - fontSize * 0.7);
          const y = -80 - i * 55 - p.random(0, 40);
          const delay = i * 180 + p.random(-50, 100);
          const rot = p.random(-p.PI / 5, p.PI / 5);
          words.push(new Word(ch, x, y, delay, rot, fontSize, '#ffffff'));
        });

        p.setTextColor = (hex) => { words.forEach((w) => (w.color = hex)); };

        // called when the window is dragged — nudge letters in that direction
        p.applyWindowImpulse = (dx, dy) => {
          const SCALE = 0.22;
          const MAX   = 10;
          const ix = Math.max(-MAX, Math.min(MAX, dx * SCALE));
          const iy = Math.max(-MAX, Math.min(MAX, dy * SCALE));
          words.forEach((w) => {
            if (w.active) { w.vx += ix; w.vy += iy; }
          });
        };
      };

      p.draw = () => {
        p.background('#3a3a3a');
        for (const w of words) {
          w.update(p, w === dragged);  // gravity + position update, no gravity when inactive or dragged
          w.edges(p);
          w.collide(words);
          w.draw(p);
        }
      };

      p.mousePressed = () => {
        for (const w of words) {
          if (w.hit(p.mouseX, p.mouseY)) {
            dragged = w;
            w.dragging = true;
            dragOff = { x: p.mouseX - w.x, y: p.mouseY - w.y };
            return;
          }
        }
      };
      p.mouseDragged = () => {
        if (dragged) {
          dragged.x = p.mouseX - dragOff.x;
          dragged.y = p.mouseY - dragOff.y;
          dragged.vy = 0; dragged.vx = 0;
        }
      };
      p.mouseReleased = () => {
        if (dragged) {
          dragged.dragging = false;
          dragged.vx = (p.mouseX - p.pmouseX) / 10;
          dragged.vy = (p.mouseY - p.pmouseY) / 10;
        }
        dragged = null;
      };
      p.windowResized = () => {
        const host = canvasHostRef.current;
        if (host) p.resizeCanvas(host.clientWidth, host.clientHeight);
      };

      class Word {
        constructor(text, x, y, delay, rot, fontSize, color) {
          this.text = text;
          this.x = x; this.y = y;
          this.vx = (Math.random() - 0.5) * 2.5;
          this.vy = 0;
          this.rot = rot;
          this.rotSpeed = (Math.random() - 0.5) * 0.025;
          this.fontSize = fontSize;
          this.color = color;
          this.delay = delay;
          this.born = null;
          this.startTime = p.millis();
          this.active = false;
          this.dragging = false;
        }
        update(p, isDragged) {
          if (!this.active) {
            if (p.millis() - this.startTime > this.delay) {
              this.active = true;
              this.born = p.millis();
            }
            return;
          }
          if (!isDragged) {
            this.vy += 0.2;                // gravity
            this.x += this.vx;
            this.y += this.vy;
            // very light air friction — keeps motion alive much longer
            this.vy *= 0.994;
            this.vx *= 0.994;
            // rotation slows naturally over 10 s
            const elapsed = (p.millis() - this.born) / 1000;
            const slow = p.map(elapsed, 0, 10, 1, 0, true);
            this.rot += this.rotSpeed * slow;
          }
        }
        edges(p) {
          if (!this.active) return;
          const half = this.fontSize * 0.4;
          // floor — elastic bounce, retains 70% energy
          if (this.y > p.height - half) {
            this.y = p.height - half;
            this.vy *= -0.7;
            this.vx *= 0.92;     // slight floor friction on x
          }
          // walls — elastic bounce, retains 75% energy
          if (this.x > p.width - half) {
            this.x = p.width - half;
            this.vx *= -0.75;
          } else if (this.x < half) {
            this.x = half;
            this.vx *= -0.75;
          }
          this.vy = p.constrain(this.vy, -25, 25);
          this.vx = p.constrain(this.vx, -25, 25);
        }
        collide(words) {
          if (!this.active) return;
          for (const other of words) {
            if (other === this || !other.active) continue;
            const dx = other.x - this.x, dy = other.y - this.y;
            const dist = Math.hypot(dx, dy);
            const minD = this.fontSize * 0.75;
            if (dist < minD && dist > 0) {
              const nx = dx / dist, ny = dy / dist; // collision normal
              // separate positions so letters don't pile on top of each other
              const overlap = (minD - dist) * 0.5;
              this.x -= nx * overlap;
              this.y -= ny * overlap;
              other.x += nx * overlap;
              other.y += ny * overlap;
              // impulse-based velocity exchange (elastic, restitution 0.75)
              const relVn = (other.vx - this.vx) * nx + (other.vy - this.vy) * ny;
              if (relVn < 0) {           // only resolve approaching pairs
                const impulse = relVn * 0.875;
                this.vx  += impulse * nx;
                this.vy  += impulse * ny;
                other.vx -= impulse * nx;
                other.vy -= impulse * ny;
              }
            }
          }
        }
        draw(p) {
          if (!this.active) return;
          p.push();
          p.translate(this.x, this.y);
          p.rotate(this.rot);
          p.noStroke();
          p.fill(this.color);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(this.fontSize);
          p.textFont(
            'Manrope, "Noto Sans TC", system-ui, -apple-system, sans-serif'
          );
          p.text(this.text, 0, 0);
          p.pop();
        }
        hit(px, py) {
          if (!this.active) return false;
          const h = this.fontSize * 0.5;
          return px > this.x - h && px < this.x + h && py > this.y - h && py < this.y + h;
        }
      }
    };

    p5InstanceRef.current = new p5(sketch);

    return () => {
      p5InitRef.current = false; // allow re-init on React Strict Mode double-invoke
      if (p5InstanceRef.current) {
        try { p5InstanceRef.current.remove(); } catch { /* noop */ }
        p5InstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="nf-page">
      {/* ── Left info ── */}
      <div className="nf-info">
        <div className="nf-404">404</div>
        <h1 className="nf-heading">Page not found</h1>
        <p className="nf-desc">
          This page doesn't exist —<br />or maybe it was never meant to.
        </p>
      </div>

      {/* ── 404 p5 window ── */}
      <DraggableWindow
        title="404 Page not found"
        initialX={p5X}
        initialY={p5Y}
        zIndex={topWindow === 'p5' ? 20 : 10}
        onFocus={() => setTopWindow('p5')}
        onClose={() => setShowP5(false)}
        onDragMove={(dx, dy) => p5InstanceRef.current?.applyWindowImpulse?.(dx, dy)}
        visible={showP5}
      >
        <div ref={canvasHostRef} className="nf-canvas-host" />
      </DraggableWindow>

      {/* ── Color picker window ── */}
      <DraggableWindow
        title="Color picker"
        initialX={colorX}
        initialY={colorY}
        zIndex={topWindow === 'color' ? 20 : 10}
        onFocus={() => setTopWindow('color')}
        onClose={() => setShowColor(false)}
        visible={showColor}
      >
        <div className="nf-color-content">
          <div
            className="nf-wheel-container"
            ref={wheelContainerRef}
            onPointerDown={onWheelDown}
            onPointerMove={onWheelMove}
            onPointerUp={onWheelUp}
            onPointerLeave={onWheelUp}
          >
            <canvas ref={wheelCanvasRef} className="nf-wheel" />
            <div
              className="nf-knob"
              style={{ left: knobPos.x, top: knobPos.y }}
              aria-hidden
            />
          </div>
          <div className="nf-color-meta">
            <span className="nf-color-chip" style={{ background: pickedColor }} />
            <span className="nf-color-hex">{pickedColor}</span>
          </div>
        </div>
      </DraggableWindow>

      {/* ── Back to Home ── */}
      <Link to="/" className="nf-home-btn" data-clickable="true">
        <img src={arrowCircleLeft} alt="" className="nf-home-arrow" />
        <span className="nf-home-divider" aria-hidden />
        <span className="nf-home-label">Back to Home</span>
      </Link>
    </div>
  );
}