import { useEffect } from "react";

/**
 * 全域超平滑滾動 Hook (v2)
 *
 * 核心修正：原版 lerp 是 frame-based（currentY += diff * ease），
 * 導致 120Hz 螢幕每秒跑兩倍、動畫快兩倍，60Hz 體感偏慢。
 *
 * 改用 frame-rate independent lerp：
 *   factor = 1 - exp(-easePerSecond × dt)
 * 無論 60 / 120 / 144 Hz，相同物理時間走完相同比例距離。
 *
 * easePerSecond ≈ 3.7 等效於原版 ease=0.03 在 120Hz 的手感，
 * 讓各螢幕體感與 4K/120Hz 一致。
 *
 * @param {object}  opts
 * @param {number}  opts.easePerSecond  - lerp 強度，預設 4
 * @param {boolean} opts.disabled       - 若為 true 則停用
 */
export default function useSmoothScroll({
  easePerSecond = 4,
  disabled      = false,
} = {}) {
  useEffect(() => {
    if (disabled) return;

    let targetY       = window.scrollY;
    let currentY      = window.scrollY;
    let rafId         = null;
    let lastTimestamp = null;

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const maxScrollY = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const onWheel = (e) => {
      e.preventDefault();
      targetY = clamp(targetY + e.deltaY, 0, maxScrollY());
      if (!rafId) {
        lastTimestamp = null;
        rafId = requestAnimationFrame(tick);
      }
    };

    const tick = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;

      // dt 上限 50ms 防止分頁切換後跳幀
      const dt = Math.min(timestamp - lastTimestamp, 50) / 1000; // seconds
      lastTimestamp = timestamp;

      const diff = targetY - currentY;

      if (Math.abs(diff) < 0.5) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        rafId = null;
        lastTimestamp = null;
        return;
      }

      // Frame-rate independent lerp：factor = 1 - e^(-k * dt)
      // k = easePerSecond，保證相同秒數走完相同比例距離，與幀率無關
      const factor = 1 - Math.exp(-easePerSecond * dt);
      currentY += diff * factor;
      window.scrollTo(0, currentY);
      rafId = requestAnimationFrame(tick);
    };

    // 鍵盤 / 捲軸拖曳等外部捲動：直接同步兩值
    const onScroll = () => {
      if (!rafId) {
        targetY  = window.scrollY;
        currentY = window.scrollY;
      }
    };

    // 讓外部程式碼透過 CustomEvent 注入目標位置（e.g. Header 錨點跳轉）
    // detail: { top: number, easePerSecond?: number }
    const onScrollTo = (e) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      const jumpEase = e.detail.easePerSecond ?? easePerSecond;
      targetY       = clamp(e.detail.top, 0, maxScrollY());
      currentY      = window.scrollY;
      lastTimestamp = null;

      const jumpTick = (timestamp) => {
        if (!lastTimestamp) lastTimestamp = timestamp;

        const dt = Math.min(timestamp - lastTimestamp, 50) / 1000;
        lastTimestamp = timestamp;

        const diff = targetY - currentY;

        if (Math.abs(diff) < 0.5) {
          currentY = targetY;
          window.scrollTo(0, currentY);
          rafId = null;
          lastTimestamp = null;
          return;
        }

        const factor = 1 - Math.exp(-jumpEase * dt);
        currentY += diff * factor;
        window.scrollTo(0, currentY);
        rafId = requestAnimationFrame(jumpTick);
      };

      rafId = requestAnimationFrame(jumpTick);
    };

    window.addEventListener("wheel",          onWheel,    { passive: false });
    window.addEventListener("scroll",         onScroll,   { passive: true  });
    window.addEventListener("smoothScrollTo", onScrollTo);

    return () => {
      window.removeEventListener("wheel",          onWheel);
      window.removeEventListener("scroll",         onScroll);
      window.removeEventListener("smoothScrollTo", onScrollTo);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }, [easePerSecond, disabled]);
}