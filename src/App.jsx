import { Outlet, useLocation } from "react-router-dom";
import HeaderVertical from "./components/HeaderVertical";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import GlobalScrollbar from "./components/GlobalScrollbar";
import { Providers } from "./providers";

function App() {
  const location = useLocation();
  const hideGlobalScrollbar = location.pathname === "/projects";
  return (
    <Providers>
      <CustomCursor />
      {!hideGlobalScrollbar && <GlobalScrollbar />}
      <HeaderVertical />
      <Outlet />
      <Footer />
    </Providers>
  );
}

export default App;
