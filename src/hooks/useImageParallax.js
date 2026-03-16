import { useScrollDetection } from "./useHorizontalScroll";

/**
 * 圖片視差滾動效果
 * 根據滾動方向與所在區域，回傳對應的 CSS class，
 * 供圖片元素套用視差位移動畫。
 *
 * @returns {{ scrollClass: string }}
 */
export const useImageParallax = () => {
  const {
    isScrolling,
    horizontalDirection,
    verticalDirection,
    isInHorizontalSection,
  } = useScrollDetection();

  const scrollClass = isScrolling
    ? isInHorizontalSection
      ? `scroll-horizontal-${horizontalDirection}`
      : `scroll-vertical-${verticalDirection}`
    : "";

  return { scrollClass };
};