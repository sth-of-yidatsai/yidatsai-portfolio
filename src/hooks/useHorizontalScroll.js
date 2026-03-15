import { useState, useEffect, useRef } from "react";

export const useScrollDetection = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [horizontalDirection, setHorizontalDirection] = useState(null);
  const [verticalDirection, setVerticalDirection] = useState(null);
  const [isInHorizontalSection, setIsInHorizontalSection] = useState(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    // 監聽原始 wheel 事件（使用者真實輸入），
    // 不依賴 lerp 平滑滾動產生的 scroll 事件，避免振動問題。
    const handleWheel = (e) => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 檢查是否在水平滾動區域內
      const currentScrollY = window.scrollY;
      const horizontalTrigger =
        window.ScrollTrigger?.getById("horizontal-scroll");
      let isInHorizontal = false;

      if (horizontalTrigger) {
        isInHorizontal =
          currentScrollY >= horizontalTrigger.start &&
          currentScrollY <= horizontalTrigger.end;
      } else {
        isInHorizontal = document.body.classList.contains(
          "horizontal-scrolling"
        );
      }

      setIsInHorizontalSection(isInHorizontal);

      // 從 wheel delta 直接讀取方向（精確、無 lerp 雜訊）
      if (isInHorizontal) {
        if (e.deltaY > 0) {
          setHorizontalDirection("right");
          setVerticalDirection(null);
        } else if (e.deltaY < 0) {
          setHorizontalDirection("left");
          setVerticalDirection(null);
        }
      } else {
        if (e.deltaY > 0) {
          setVerticalDirection("down");
          setHorizontalDirection(null);
        } else if (e.deltaY < 0) {
          setVerticalDirection("up");
          setHorizontalDirection(null);
        }
      }

      setIsScrolling(true);

      // 最後一次 wheel 事件後 300ms 才重置（對應平滑滾動收尾時間）
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setHorizontalDirection(null);
        setVerticalDirection(null);
      }, 300);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    isScrolling,
    horizontalDirection,
    verticalDirection,
    isInHorizontalSection,
  };
};
