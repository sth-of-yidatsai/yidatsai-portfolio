import { useEffect } from "react";

/**
 * 全域超平滑滾動 Hook
 * 攔截滑鼠滾輪事件，以 lerp (線性插值) 模擬慣性，
 * 再透過 window.scrollTo() 驅動原生捲軸，
 * 完整相容 GSAP ScrollTrigger 與自製 GlobalScrollbar。
 *
 * @param {object}  opts
 * @param {number}  opts.ease      - lerp 系數 (0~1)，越小越滑順，預設 0.09
 * @param {boolean} opts.disabled  - 若為 true 則停用
 */
export default function useSmoothScroll({ ease = 0.03, disabled = false } = {}) {
  useEffect(() => {
    if (disabled) return;

    let targetY  = window.scrollY;
    let currentY = window.scrollY;
    let rafId    = null;

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const maxScrollY = () =>
      Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

    const onWheel = (e) => {
      e.preventDefault();
      targetY = clamp(targetY + e.deltaY, 0, maxScrollY());
      if (!rafId) tick();
    };

    const tick = () => {
      const diff = targetY - currentY;

      // 差距夠小就停住，避免無限微抖
      if (Math.abs(diff) < 0.5) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        rafId = null;
        return;
      }

      currentY += diff * ease;
      window.scrollTo(0, currentY);
      rafId = requestAnimationFrame(tick);
    };

    // 當使用者用鍵盤、點擊捲軸等方式直接改變捲軸位置時同步 target
    const onScroll = () => {
      if (!rafId) {
        // 沒有 wheel 動畫進行中 → 外部觸發的捲動，直接同步兩值
        targetY  = window.scrollY;
        currentY = window.scrollY;
      }
    };

    // 讓外部程式碼透過 CustomEvent 注入目標位置，由 smooth scroll 系統執行動畫
    // detail.ease 可選，覆蓋預設 ease 值，tick 結束後自動還原
    const onScrollTo = (e) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      const jumpEase = e.detail.ease ?? ease;
      targetY  = clamp(e.detail.top, 0, maxScrollY());
      currentY = window.scrollY;

      const jumpTick = () => {
        const diff = targetY - currentY;
        if (Math.abs(diff) < 0.5) {
          currentY = targetY;
          window.scrollTo(0, currentY);
          rafId = null;
          return;
        }
        currentY += diff * jumpEase;
        window.scrollTo(0, currentY);
        rafId = requestAnimationFrame(jumpTick);
      };

      jumpTick();
    };

    window.addEventListener("wheel",          onWheel,    { passive: false });
    window.addEventListener("scroll",         onScroll,   { passive: true });
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
  }, [ease, disabled]);
}