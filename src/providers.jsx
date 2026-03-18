import React from "react";
import { LoaderProvider } from "./hooks/use-loader/index.jsx";
import { Loader } from "./hooks/use-loader/components.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";

export function Providers({ children }) {
  return (
    <LanguageProvider>
      <LoaderProvider minLoadTime={2000} routeMinLoadTime={600} CustomLoader={Loader}>
        {children}
      </LoaderProvider>
    </LanguageProvider>
  );
}

export default Providers;
