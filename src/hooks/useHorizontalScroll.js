import { useState, useEffect, useRef } from "react";

export const useScrollDetection = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [horizontalDirection, setHorizontalDirection] = useState(null);
  const [verticalDirection, setVerticalDirection] = useState(null);
  const [isInHorizontalSection, setIsInHorizontalSection] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const lastScrollXRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentScrollX = window.scrollX;

      // 清除之前的 timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 檢查是否在水平滾動區域內
      // 使用 ScrollTrigger 來獲取實際的水平滾動區域位置
      const horizontalTrigger =
        window.ScrollTrigger?.getById("horizontal-scroll");
      let isInHorizontal = false;

      if (horizontalTrigger) {
        const triggerStart = horizontalTrigger.start;
        const triggerEnd = horizontalTrigger.end;
        isInHorizontal =
          currentScrollY >= triggerStart && currentScrollY <= triggerEnd;
      } else {
        // 如果 ScrollTrigger 還沒初始化，使用 body 的 class 來判斷
        isInHorizontal = document.body.classList.contains(
          "horizontal-scrolling"
        );
      }

      setIsInHorizontalSection(isInHorizontal);

      // 偵測滾動方向
      if (isInHorizontal) {
        // 在水平滾動區域內：只觸發水平位移
        if (currentScrollY > lastScrollYRef.current) {
          setHorizontalDirection("right");
          setVerticalDirection(null); // 清除垂直方向
        } else if (currentScrollY < lastScrollYRef.current) {
          setHorizontalDirection("left");
          setVerticalDirection(null); // 清除垂直方向
        }
      } else {
        // 在一般區域：只觸發垂直位移
        if (currentScrollY > lastScrollYRef.current) {
          setVerticalDirection("down");
          setHorizontalDirection(null); // 清除水平方向
        } else if (currentScrollY < lastScrollYRef.current) {
          setVerticalDirection("up");
          setHorizontalDirection(null); // 清除水平方向
        }
      }

      setIsScrolling(true);
      lastScrollYRef.current = currentScrollY;
      lastScrollXRef.current = currentScrollX;

      // 設置 timeout 來檢測滾動停止
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setHorizontalDirection(null);
        setVerticalDirection(null);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
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
