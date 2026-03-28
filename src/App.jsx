import { Outlet, useMatches } from "react-router-dom";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import GlobalScrollbar from "./components/GlobalScrollbar";
import { Providers } from "./providers";

function App() {
  const matches = useMatches();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    // Lenis scroll → ScrollTrigger 同步更新（解決 pin spacer 偏差）
    lenis.on("scroll", ScrollTrigger.update);

    // GSAP ticker 驅動 Lenis，確保與 ScrollTrigger 同幀
    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const match = [...matches].reverse().find((m) => m.handle?.title);
    if (match) {
      document.title = match.handle.title(match.data);
    }
  }, [matches]);

  return (
    <Providers>
      <CustomCursor />
      <GlobalScrollbar />
      <Header />
      <Outlet />
      <Footer />
    </Providers>
  );
}

export default App;
