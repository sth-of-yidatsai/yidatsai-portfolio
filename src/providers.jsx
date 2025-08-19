import React from "react";
import { LoaderProvider } from "./hooks/use-loader/index.jsx";
import { Loader } from "./hooks/use-loader/components.jsx";

/**
 * 全域Providers
 * 包含所有需要全域共享的Context
 */
export function Providers({ children }) {
  return (
    <LoaderProvider minLoadTime={2000} CustomLoader={Loader}>
      {children}
    </LoaderProvider>
  );
}

export default Providers;
