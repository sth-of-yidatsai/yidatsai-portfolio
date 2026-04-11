import { Outlet, useMatches } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useMeta } from "./hooks/useMeta";
import { useLanguage } from "./contexts/LanguageContext";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import GlobalScrollbar from "./components/GlobalScrollbar";
import { Providers } from "./providers";

// Inner shell — rendered inside <Providers>, so context hooks work here
function AppShell({ lenisRef }) {
  const matches = useMatches();
  const [currentMeta, setCurrentMeta] = useState({});
  const { language } = useLanguage();
  useMeta(currentMeta);

  // loader 隱藏後（overflow:'' 恢復）重新計算頁面高度。
  useEffect(() => {
    const handler = () => {
      const lenis = lenisRef.current;
      if (lenis) lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("loader:hidden", handler);
    return () => window.removeEventListener("loader:hidden", handler);
  }, [lenisRef]);

  useEffect(() => {
    const match = [...matches].reverse().find((m) => m.handle?.title);
    if (match) {
      document.title = match.handle.title(match.data, language);
    }
  }, [matches, language]);

  useEffect(() => {
    const match = [...matches].reverse().find((m) => m.handle?.meta);
    if (match) {
      setCurrentMeta(match.handle.meta(match.data, language));
    }
  }, [matches, language]);

  return (
    <>
      <CustomCursor />
      <GlobalScrollbar />
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Lenis scroll → ScrollTrigger 同步更新（解決 pin spacer 偏差）
    lenis.on("scroll", ScrollTrigger.update);

    // GSAP ticker 驅動 Lenis，確保與 ScrollTrigger 同幀
    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <Providers>
      <AppShell lenisRef={lenisRef} />
    </Providers>
  );
}

export default App;
