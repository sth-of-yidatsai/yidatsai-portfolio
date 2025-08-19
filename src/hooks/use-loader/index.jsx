import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";
import { Loader } from "./components.jsx";

// 創建 Context
const LoaderContext = createContext();

/**
 * LoaderProvider - 全域載入動畫提供者
 * @param {number} minLoadTime - 最小載入時間（毫秒），預設1500ms
 * @param {React.Component} CustomLoader - 自訂載入組件
 * @param {React.ReactNode} children - 子組件
 */
export function LoaderProvider({
  minLoadTime = 1500,
  CustomLoader = Loader,
  children,
}) {
  const location = useLocation();
  const [loading, setLoading] = useState(true); // 初始為載入中
  const [show, setShow] = useState(true); // 初始顯示loader
  const [isPageReady, setIsPageReady] = useState(false);

  // 頁面載入完成後的處理
  useEffect(() => {
    const handlePageLoad = () => {
      setIsPageReady(true);
    };

    // 檢查頁面是否已經載入完成
    if (document.readyState === "complete") {
      handlePageLoad();
    } else {
      window.addEventListener("load", handlePageLoad);
    }

    return () => {
      window.removeEventListener("load", handlePageLoad);
    };
  }, []);

  // 路由變化時重新顯示loading
  useEffect(() => {
    setLoading(true);
    setShow(true);
    setIsPageReady(false);

    // 短延遲後標記頁面準備就緒（用於路由切換）
    const routeTimer = setTimeout(() => {
      setIsPageReady(true);
    }, 100);

    return () => clearTimeout(routeTimer);
  }, [location.pathname]);

  // 當頁面準備好後，等待最小載入時間然後隱藏loader
  useEffect(() => {
    if (isPageReady) {
      const timer = setTimeout(() => {
        setLoading(false);
        setShow(false);
      }, minLoadTime);

      return () => clearTimeout(timer);
    }
  }, [isPageReady, minLoadTime]);

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
      {/* 只有在loading完成後才顯示內容 */}
      <div
        style={{ opacity: loading ? 0 : 1, transition: "opacity 0.5s ease" }}
      >
        {children}
      </div>
      <CustomLoader show={show} />
    </LoaderContext.Provider>
  );
}

/**
 * useLoader Hook
 * @returns {Object} - { loading, show, showLoader, hideLoader }
 */
export function useLoader() {
  const context = useContext(LoaderContext);

  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }

  return context;
}

export default useLoader;
