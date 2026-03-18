import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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
  useEffect(() => {
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

  // ── 頁面準備好後等最小時間，再隱藏 loader ──────────────────────────
  useEffect(() => {
    if (!isPageReady) return;

    const timer = setTimeout(() => {
      setLoading(false);
      setShow(false);
    }, minTimeRef.current);

    return () => clearTimeout(timer);
  }, [isPageReady]);

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
