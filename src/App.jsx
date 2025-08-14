import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import ScrollToTop from './components/ScrollToTop';
import GlobalScrollbar from './components/GlobalScrollbar';

function App() {
  const location = useLocation();
  const hideGlobalScrollbar = location.pathname === '/projects';
  return (
    <>
      <CustomCursor />
      <ScrollToTop />
      {!hideGlobalScrollbar && <GlobalScrollbar />}
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
