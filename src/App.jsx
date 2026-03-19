import { Outlet, useMatches } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import GlobalScrollbar from "./components/GlobalScrollbar";
import { Providers } from "./providers";
import useSmoothScroll from "./hooks/useSmoothScroll";

function App() {
  useSmoothScroll();
  const matches = useMatches();

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
