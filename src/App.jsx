import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import GlobalScrollbar from "./components/GlobalScrollbar";
import { Providers } from "./providers";
import useSmoothScroll from "./hooks/useSmoothScroll";

function App() {
  useSmoothScroll();
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
