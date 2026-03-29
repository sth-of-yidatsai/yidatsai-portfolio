import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import { Loader } from "./components.jsx";

const LoaderContext = createContext();

/**
 * LoaderProvider - 全域載入動畫提供者
 * @param {number} minLoadTime      - 初始頁面最小載入時間（毫秒），預設 1500ms
 * @param {number} routeMinLoadTime - 路由切換最小載入時間（毫秒），預設 600ms
 * @param {React.Component} CustomLoader - 自訂載入組件
 * @param {React.ReactNode} children
 */
export function LoaderProvider({
  minLoadTime = 1500,
  routeMinLoadTime = 600,
  CustomLoader = Loader,
  children,
}) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(true);
  const [isPageReady, setIsPageReady] = useState(false);

  // ── Content gate：讓頁面元件（如 ProjectDetail）持有一把鑰匙，
  //    直到非同步內容（圖片）預載完成才放行，避免 Loader 提前關閉。
  //    使用 ref 計數器避免 setState batching 競態問題。
  const gateCountRef = useRef(0);
  const [contentReady, setContentReady] = useState(true);

  const waitForContent = useCallback(() => {
    gateCountRef.current += 1;
    setContentReady(false);
  }, []);

  const signalContentReady = useCallback(() => {
    gateCountRef.current = Math.max(0, gateCountRef.current - 1);
    if (gateCountRef.current === 0) setContentReady(true);
  }, []);

  // 記住當下這次等待應該用哪個最小時間
  const minTimeRef = useRef(minLoadTime);
  // 標記是否是首次掛載（第一次 pathname effect 不要觸發路由切換邏輯）
  const isInitialLoad = useRef(true);

  // ── 初始頁面載入 ────────────────────────────────────────────────────
  useEffect(() => {
    minTimeRef.current = minLoadTime;

    const markReady = () => {
      // 等字體載入完成再放行，避免 loader 消失時文字閃爍 (FOUC)
      document.fonts.ready.then(() => setIsPageReady(true));
    };

    if (document.readyState === "complete") {
      markReady();
    } else {
      window.addEventListener("load", markReady);
      return () => window.removeEventListener("load", markReady);
    }
  }, [minLoadTime]);

  // ── 路由切換 ────────────────────────────────────────────────────────
  // useLayoutEffect：在 DOM 更新後、瀏覽器 paint 前同步執行。
  // setShow(true) 必須在 paint 前完成，確保 Loader 覆蓋層和新頁面在同一幀被畫出，
  // 避免新頁面先被 paint 一幀再被 Loader 蓋住（視覺閃爍）。
  useLayoutEffect(() => {
    // 首次掛載時跳過（由上方 initial load effect 處理）
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    minTimeRef.current = routeMinLoadTime;
    setLoading(true);
    setShow(true);
    setIsPageReady(false);

    let cancelled = false;

    Promise.all([
      // 等字體就緒（新頁面若有新字體變體也會被等到）
      document.fonts.ready,
      // 給 React 一個 tick 渲染新頁面後再 sample fonts
      new Promise((r) => setTimeout(r, 50)),
    ]).then(() => {
      if (!cancelled) setIsPageReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [location.pathname, routeMinLoadTime]);

  // ── Loader 顯示時鎖定 body 滾動 ──────────────────────────────────────
  // 確保 BlockRenderer 掛載、GSAP useLayoutEffect 執行時 scrollY = 0，
  // 避免 pin spacer 的 start/end 位置因非零 scrollY 而計算錯誤。
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // overflow 恢復後，body 的真實 scrollHeight 才正確。
      // 通知 Lenis / ScrollTrigger 在下一幀重新計算 limit 與 pin spacer。
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('loader:hidden'));
      });
    }
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  // ── 頁面準備好 + 內容 gate 全部放行後，等最小時間再隱藏 loader ──────
  const allReady = isPageReady && contentReady;
  useEffect(() => {
    if (!allReady) return;

    const timer = setTimeout(() => {
      setLoading(false);
      setShow(false);
    }, minTimeRef.current);

    return () => clearTimeout(timer);
  }, [allReady]);

  const showLoader = useCallback(() => {
    setLoading(true);
    setShow(true);
  }, []);

  const hideLoader = useCallback(() => {
    setLoading(false);
    setShow(false);
  }, []);

  const value = {
    loading,
    show,
    showLoader,
    hideLoader,
    isPageReady,
    waitForContent,
    signalContentReady,
  };

  return (
    <LoaderContext.Provider value={value}>
      {children}
      <CustomLoader show={show} />
    </LoaderContext.Provider>
  );
}

/**
 * useLoader Hook
 * @returns {Object} - { loading, show, showLoader, hideLoader, isPageReady }
 */
export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
}

export default useLoader;
