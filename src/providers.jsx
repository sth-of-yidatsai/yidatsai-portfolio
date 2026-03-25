import React from "react";
import { LoaderProvider } from "./hooks/use-loader/index.jsx";
import { Loader } from "./hooks/use-loader/components.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";
import { ScrollDetectionProvider } from "./contexts/ScrollDetectionContext.jsx";

export function Providers({ children }) {
  return (
    <ScrollDetectionProvider>
      <LanguageProvider>
        <LoaderProvider minLoadTime={2000} routeMinLoadTime={600} CustomLoader={Loader}>
          {children}
        </LoaderProvider>
      </LanguageProvider>
    </ScrollDetectionProvider>
  );
}

export default Providers;
