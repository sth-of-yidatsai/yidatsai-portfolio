import { useEffect } from "react";
import { gsap } from "gsap";

/**
 * 全域超平滑滾動 Hook (v3)
 *
 * v3 核心改進：從 requestAnimationFrame 改用 gsap.ticker
 *
 * 問題根源（v2）：
 *   useSmoothScroll 用獨立 rAF，GSAP ScrollTrigger 也有自己的 ticker（rAF）。
 *   兩個 rAF 執行順序每幀不固定：若 GSAP ticker 先跑，它讀到的是
 *   上一幀的 scrollY（smooth scroll 還沒更新），導致動畫位置永遠落後
 *   一幀 ≈ 16.7ms，在 pin 邊界造成視覺抖動（scrub: true 無 lerp 緩衝）。
 *
 * 解法：
 *   透過 gsap.ticker.add(tick) 把 scroll lerp 掛進 GSAP 的更新循環，
 *   確保「smooth scroll 更新 scrollY → GSAP ScrollTrigger 讀值 → 渲染」
 *   全部在同一個 tick 內完成，消除跨幀 desync。
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

    let targetY     = window.scrollY;
    let currentY    = window.scrollY;
    let activeEase  = easePerSecond;
    let isActive    = false;

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const maxScrollY = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const onWheel = (e) => {
      e.preventDefault();
      targetY    = clamp(targetY + e.deltaY, 0, maxScrollY());
      activeEase = easePerSecond;
      isActive   = true;
    };

    // GSAP ticker callback：(time: seconds, deltaTime: ms, frame: number)
    // 在 GSAP 內部 ScrollTrigger 更新之前執行，確保同幀內 scrollY 已是最新值
    const tick = (_time, deltaTime) => {
      if (!isActive) return;

      // dt 上限 50ms 防止分頁切換後跳幀（GSAP lagSmoothing 亦有類似保護）
      const dt   = Math.min(deltaTime / 1000, 0.05);
      const diff = targetY - currentY;

      if (Math.abs(diff) < 0.5) {
        currentY   = targetY;
        activeEase = easePerSecond;
        isActive   = false;
        window.scrollTo(0, currentY);
        return;
      }

      // Frame-rate independent lerp：factor = 1 - e^(-k * dt)
      const factor = 1 - Math.exp(-activeEase * dt);
      currentY += diff * factor;
      window.scrollTo(0, currentY);
    };

    // 鍵盤 / 捲軸拖曳等外部捲動：直接同步兩值
    const onScroll = () => {
      if (!isActive) {
        targetY  = window.scrollY;
        currentY = window.scrollY;
      }
    };

    // 讓外部程式碼透過 CustomEvent 注入目標位置（e.g. Header 錨點跳轉）
    // detail: { top: number, easePerSecond?: number }
    const onScrollTo = (e) => {
      targetY    = clamp(e.detail.top, 0, maxScrollY());
      currentY   = window.scrollY;
      activeEase = e.detail.easePerSecond ?? easePerSecond;
      isActive   = true;
    };

    window.addEventListener("wheel",          onWheel,    { passive: false });
    window.addEventListener("scroll",         onScroll,   { passive: true  });
    window.addEventListener("smoothScrollTo", onScrollTo);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("wheel",          onWheel);
      window.removeEventListener("scroll",         onScroll);
      window.removeEventListener("smoothScrollTo", onScrollTo);
      gsap.ticker.remove(tick);
      isActive = false;
    };
  }, [easePerSecond, disabled]);
}
