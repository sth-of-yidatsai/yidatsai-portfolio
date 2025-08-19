import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import ScrollToTop from "./components/ScrollToTop";
import GlobalScrollbar from "./components/GlobalScrollbar";
import { Providers } from "./providers";

function App() {
  const location = useLocation();
  const hideGlobalScrollbar = location.pathname === "/projects";
  return (
    <Providers>
      <CustomCursor />
      <ScrollToTop />
      {!hideGlobalScrollbar && <GlobalScrollbar />}
      <Header />
      <Outlet />
      <Footer />
    </Providers>
  );
}

export default App;
