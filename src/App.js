import React, { useEffect, useState, lazy, Suspense } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { store, persistor } from "./store";
import history from "./history";
import { THEME_CONFIG } from "./configs/AppConfig";
import { PersistGate } from "redux-persist/integration/react";
import "./lang";
// import { setSession } from "store/slices/authSlice";
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

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: 'offlineFirst',
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: true,
      },
    },
  });

  useEffect(() => {
    import("@tanstack/query-sync-storage-persister").then(({ createSyncStoragePersister }) => {
      import("@tanstack/react-query-persist-client").then(({ persistQueryClient }) => {
        const localStoragePersister = createSyncStoragePersister({ storage: window.localStorage });
        persistQueryClient({
          queryClient,
          persister: localStoragePersister,
        });
      });
    });
  }, []);

  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const choiceResult = await window.deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      window.deferredPrompt = null;
    }
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
                  <Suspense fallback={<div>Loading Layouts...</div>}>
                    <Layouts />
                  </Suspense>
                  {showInstallButton && window.deferredPrompt && (
                    <button onClick={handleInstallClick}>Install App</button>
                  )}
                  {process.env.NODE_ENV === 'development' && ReactQueryDevtools && (
                    <Suspense fallback={null}>
                      <ReactQueryDevtools initialIsOpen={false} />
                    </Suspense>
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