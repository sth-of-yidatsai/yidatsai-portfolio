import { useScrollDetection } from "./useHorizontalScroll";

/**
 * 圖片視差滾動效果
 * 根據滾動方向與所在區域，回傳對應的 CSS class，
 * 供圖片元素套用視差位移動畫。
 *
 * @param {object} [options]
 * @param {boolean} [options.stickyHorizontal=false]
 *   設為 true 時，表示該 section 使用黏性滾動（垂直捲動驅動水平內容），
 *   此時垂直方向的 wheel delta 會對應到水平方向 class，
 *   不產生垂直位移效果。
 * @returns {{ scrollClass: string }}
 */
export const useImageParallax = ({ stickyHorizontal = false } = {}) => {
  const {
    isScrolling,
    horizontalDirection,
    verticalDirection,
    isInHorizontalSection,
  } = useScrollDetection();

  let scrollClass = "";
  if (isScrolling) {
    if (isInHorizontalSection) {
      scrollClass = `scroll-horizontal-${horizontalDirection}`;
    } else if (stickyHorizontal) {
      // 黏性滾動 section：垂直捲動驅動水平視覺，
      // 將 deltaY 方向對應到水平 class，避免垂直位移。
      const dir = verticalDirection === "down" ? "right" : "left";
      scrollClass = `scroll-horizontal-${dir}`;
    } else {
      scrollClass = `scroll-vertical-${verticalDirection}`;
    }
  }

  return { scrollClass };
};