import { useScrollDetection } from "./useHorizontalScroll";

/**
 * 圖片視差滾動效果
 * 根據滾動方向與所在區域，回傳對應的 CSS class，
 * 供圖片元素套用視差位移動畫。
 *
 * @param {object} [options]
 * @param {boolean} [options.inStickySection=false]
 *   設為 true 時，表示目前處於黏性滾動定位狀態，
 *   此時停用所有視差位移效果（回傳空字串）。
 *   傳入動態值（如 isInSection）可在釋放後自動恢復正常視差。
 * @returns {{ scrollClass: string }}
 */
export const useImageParallax = ({ inStickySection = false } = {}) => {
  const {
    isScrolling,
    horizontalDirection,
    verticalDirection,
    isInHorizontalSection,
  } = useScrollDetection();

  if (!isScrolling || inStickySection) return { scrollClass: "" };

  const scrollClass = isInHorizontalSection
    ? `scroll-horizontal-${horizontalDirection}`
    : `scroll-vertical-${verticalDirection}`;

  return { scrollClass };
};
