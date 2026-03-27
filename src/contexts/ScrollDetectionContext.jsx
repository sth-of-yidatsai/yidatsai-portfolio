import { createContext, useContext, useReducer, useEffect, useRef } from 'react';

const initial = {
  isScrolling: false,
  horizontalDirection: null,
  verticalDirection: null,
  isInHorizontalSection: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'WHEEL':
      // 方向未改變時回傳同一個 reference，避免 Provider re-render 與 GC 壓力
      if (
        state.isScrolling === true &&
        state.horizontalDirection === action.horizontalDirection &&
        state.verticalDirection === action.verticalDirection &&
        state.isInHorizontalSection === action.isInHorizontalSection
      ) return state;
      return {
        isScrolling: true,
        horizontalDirection: action.horizontalDirection,
        verticalDirection: action.verticalDirection,
        isInHorizontalSection: action.isInHorizontalSection,
      };
    case 'STOP':
      return initial;
    default:
      return state;
  }
}

const ScrollDetectionContext = createContext(initial);

export function ScrollDetectionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const currentScrollY = window.scrollY;
      const horizontalTrigger = window.ScrollTrigger?.getById('horizontal-scroll');
      let isInHorizontal = false;

      if (horizontalTrigger) {
        isInHorizontal =
          currentScrollY >= horizontalTrigger.start &&
          currentScrollY <= horizontalTrigger.end;
      } else {
        isInHorizontal = document.body.classList.contains('horizontal-scrolling');
      }

      let horizontalDirection = null;
      let verticalDirection = null;

      if (isInHorizontal) {
        if (e.deltaY > 0) horizontalDirection = 'right';
        else if (e.deltaY < 0) horizontalDirection = 'left';
      } else {
        if (e.deltaY > 0) verticalDirection = 'down';
        else if (e.deltaY < 0) verticalDirection = 'up';
      }

      dispatch({
        type: 'WHEEL',
        horizontalDirection,
        verticalDirection,
        isInHorizontalSection: isInHorizontal,
      });

      // 直接寫入 body attribute — 繞過 React batching，讓 CSS 立即響應，
      // 消除 ParallaxImg / HeroBlock 等多個元件因 context 更新而觸發的 re-render。
      // 只在值真正改變時寫入，避免重複 setAttribute 觸發不必要的 style recalc。
      const attr = isInHorizontal
        ? (horizontalDirection ? `horizontal-${horizontalDirection}` : null)
        : (verticalDirection   ? `vertical-${verticalDirection}`     : null);
      if (attr && document.body.dataset.scroll !== attr) {
        document.body.dataset.scroll = attr;
      }

      timeoutRef.current = setTimeout(() => {
        delete document.body.dataset.scroll;
        dispatch({ type: 'STOP' });
      }, 300);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <ScrollDetectionContext.Provider value={state}>
      {children}
    </ScrollDetectionContext.Provider>
  );
}

export function useScrollDetection() {
  return useContext(ScrollDetectionContext);
}
