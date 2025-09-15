import { useState, useEffect, useRef } from "react";

export const useHorizontalScroll = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState(null);
  const scrollTimeoutRef = useRef(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 清除之前的 timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 偵測滾動方向（垂直滾動觸發水平滾動）
      if (currentScrollY > lastScrollYRef.current) {
        setScrollDirection("right");
        console.log("滾動方向: 右");
      } else if (currentScrollY < lastScrollYRef.current) {
        setScrollDirection("left");
        console.log("滾動方向: 左");
      }

      setIsScrolling(true);
      lastScrollYRef.current = currentScrollY;

      // 設置 timeout 來檢測滾動停止
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setScrollDirection(null);
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

  return { isScrolling, scrollDirection };
};
