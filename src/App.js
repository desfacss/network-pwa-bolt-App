import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { store, persistor } from "./store";
import history from "./history";
import { THEME_CONFIG } from "./configs/AppConfig";
import { PersistGate } from "redux-persist/integration/react";
import "./lang";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleProvider } from '@ant-design/cssinjs';

// Lazy load Layouts
const Layouts = lazy(() => import("./layouts"));

// Conditionally import ReactQueryDevtools
const ReactQueryDevtools = process.env.NODE_ENV === 'development'
  ? React.lazy(() => import("@tanstack/react-query-devtools").then(module => ({
      default: module.ReactQueryDevtools,
    })))
  : null;

const themes = {
  dark: `${process.env.PUBLIC_URL}/css/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/css/light-theme.css`,
};

// Utility: iOS detection
const isIOS = () =>
  /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

const isInStandaloneMode = () =>
  "standalone" in window.navigator && window.navigator.standalone;

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: 'offlineFirst',
        staleTime: 1000 * 60,
        refetchOnWindowFocus: true,
      },
    },
  });

  const [isIosBannerVisible, setIosBannerVisible] = useState(false);

  useEffect(() => {
    if (isIOS() && !isInStandaloneMode()) {
      setIosBannerVisible(true);
    }
  }, []);

  const handleCloseIosBanner = () => {
    setIosBannerVisible(false);
  };

  useEffect(() => {
    if (THEME_CONFIG.currentTheme === 'dark') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${process.env.PUBLIC_URL}/css/dark-theme.css`;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="App">
      <StyleProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter history={history}>
              <ThemeSwitcherProvider themeMap={themes} defaultTheme={THEME_CONFIG.currentTheme} insertionPoint="styles-insertion-point">
                <QueryClientProvider client={queryClient}>
                  <Suspense fallback={<div></div>}>
                    <Layouts />
                  </Suspense>

                  {/* Custom banner for iOS users */}
                  {isIosBannerVisible && (
                    <div style={{ position: 'fixed', bottom: 10, left: 10, right: 10, background: '#fff', padding: '1rem', border: '1px solid #ccc', borderRadius: 8 }}>
                      <p>
                        Install this app on your iPhone: tap <strong>Share</strong> and then <strong>Add to Home Screen</strong>.
                      </p>
                      <button onClick={handleCloseIosBanner}>Close</button>
                    </div>
                  )}
                </QueryClientProvider>
              </ThemeSwitcherProvider>
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </StyleProvider>
    </div>
  );
}

export default App;