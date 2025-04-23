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
import { supabase } from "configs/SupabaseConfig";
import { Button } from "antd";

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
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: true,
      },
    },
  });

  // useEffect(() => {
  //   import("@tanstack/query-sync-storage-persister").then(({ createSyncStoragePersister }) => {
  //     import("@tanstack/react-query-persist-client").then(({ persistQueryClient }) => {
  //       const localStoragePersister = createSyncStoragePersister({ storage: window.localStorage });
  //       persistQueryClient({
  //         queryClient,
  //         persister: localStoragePersister,
  //       });
  //     });
  //   });
  // }, []);

  const [showInstallButton, setShowInstallButton] = useState(false);
  const deferredPromptRef = useRef(null);
  const [isIosBannerVisible, setIosBannerVisible] = useState(false);

  // VAPID public key (replace with your generated key)
  const VAPID_PUBLIC_KEY = 'BMr-4WJsZHer9LyiG8KiUy-kSH4RRIAWVLizSihOwN1raQrkLLuWIkilc1RY46B2RaMmxnwzEfDZLL60YYvePFU'; // Add your VAPID public key here

  // Android install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      const isAppInstalled = isInStandaloneMode() || window.matchMedia('(display-mode: standalone)').matches;
      console.log('[Install Prompt] beforeinstallprompt fired, isAppInstalled:', isAppInstalled);
      deferredPromptRef.current = e;
      setShowInstallButton(!isAppInstalled);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // iOS install check
  useEffect(() => {
    if (isIOS() && !isInStandaloneMode()) {
      setIosBannerVisible(true);
    }
  }, []);

  // Handle push notification subscription
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registerPush = async () => {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });

          // Generate a unique device ID (e.g., random UUID)
          const deviceId = crypto.randomUUID();

          // Send subscription to Supabase
          const { error } = await supabase
            .from('users')
            .update({
              subscriptions: supabase.jsonb.buildObject(
                'devices',
                supabase.jsonb.arrayAppend(
                  supabase.jsonb.extractPath('subscriptions', 'devices'),
                  {
                    endpoint: subscription.endpoint,
                    keys: {
                      p256dh: subscription.getKey('p256dh')
                        ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))))
                        : '',
                      auth: subscription.getKey('auth')
                        ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
                        : '',
                    },
                    device_id: deviceId,
                    created_at: new Date().toISOString(),
                  }
                )
              ),
            })
            .eq('auth_id', (await supabase.auth.getUser()).user.id); // Assumes user is logged in

          if (error) {
            console.error('Failed to save subscription:', error);
          } else {
            console.log('Push subscription saved');
          }
        } catch (err) {
          console.error('Push subscription failed:', err);
        }
      };

      // Request notification permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          registerPush();
        }
      });
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      const choiceResult = await deferredPromptRef.current.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPromptRef.current = null;
      setShowInstallButton(false);
    }
  };

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
                  <Suspense fallback={<div>Loading Layouts...</div>}>
                    {/* Install prompt for Android - placed inside Suspense to prevent flickering during layout loading */}
                    {showInstallButton && deferredPromptRef.current && (
                      <Button
                      type="primary"
                      shape="round"
                      size="large"
                      onClick={handleInstallClick}
                      style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1000,
                        border: '2px solid red', // Debug border to confirm visibility
                      }}
                    >
                      Install App
                    </Button>
                    )}
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

                  {/* React Query Devtools (dev only) */}
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

// Utility function to convert VAPID public key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default App;