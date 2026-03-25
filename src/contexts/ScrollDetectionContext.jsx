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

      timeoutRef.current = setTimeout(() => {
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
