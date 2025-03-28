import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { store, persistor } from "./store";
import history from "./history";
import Layouts from "./layouts";
import { THEME_CONFIG } from "./configs/AppConfig";
import { PersistGate } from "redux-persist/integration/react";
import "./lang";
import { setSession } from "store/slices/authSlice";
import { supabase } from "configs/SupabaseConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
// import { indexedDB } from "state/services/indexedDB";
// import { store } from "../store";
import { StyleProvider } from '@ant-design/cssinjs';

const themes = {
  dark: `${process.env.PUBLIC_URL}/css/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/css/light-theme.css`,
};

// (async () => {
//   await indexedDB.init();
// })();

function App() {
  // useEffect(() => {
  //   // Fetch the session and user data
  //   const fetchUserData = async (session) => {
  //     if (!session || !session.user) return;

  //     // Fetch user data from the users table
  //     const { data: userData, error: userError } = await supabase.from('users').select('*,location:location_id (*), hr:hr_id (*), manager:manager_id (*),organization:organization_id (*),features:role_type (feature)').eq('id', session.user.id).single();

  //     if (userError) {
  //       console.error('Error fetching user data:', userError);
  //       return;
  //     }

  //     // Combine user data with role feature
  //     const updatedSession = {
  //       ...session,
  //       user: {
  //         ...userData,
  //         // feature: roleData?.feature || null, // Add the role feature here
  //       },
  //     };
  //     console.log("Session", updatedSession);

  //     // Dispatch the updated session to Redux
  //     store.dispatch(setSession(updatedSession));
  //   };

  //   // Get the initial session
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     if (session) {
  //       fetchUserData(session);
  //     }
  //   });

  //   // Listen for authentication state changes
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((_event, session) => {
  //     // console.log('Supabase Event', _event);
  //     if (session) {
  //       fetchUserData(session);
  //     }
  //   });

  //   // Cleanup subscription on component unmount
  //   return () => subscription.unsubscribe();
  // }, [supabase]);

  // Create a QueryClient instance
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: 'offlineFirst', // Use offline first strategy
        staleTime: 1000 * 60 * 1, // 1 minutes
        // The staleTime of 5 minutes might be too long or too short depending on your application's data freshness requirements. If the data changes frequently, you might want a shorter staleTime to ensure users see updates sooner. If data changes less often, this might be fine
        refetchOnWindowFocus: false,
        // refetchOnWindowFocus: (query) => query.queryKey[0] === 'data', // Only refetch for 'data' queries - FOR BETTER CONTROL OF WHAT YOU WANT TO LOAD****
        // Setting refetchOnWindowFocus to false means the app won't automatically refetch data when the user returns to the tab/window. This could lead to users seeing outdated information if they expect real-time or near real-time updates.
      },
    },
  });
  // Persist the QueryClient state
  const localStoragePersister = createSyncStoragePersister({ storage: window.localStorage });
  persistQueryClient({
    queryClient,
    persister: localStoragePersister,
  });
  // const persister = createAsyncStoragePersister({
  //   storage: AsyncStorage,
  // });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
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

  return (
    <div className="App">
      <StyleProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter history={history}>
              <ThemeSwitcherProvider themeMap={themes} defaultTheme={THEME_CONFIG.currentTheme} insertionPoint="styles-insertion-point" >
                <QueryClientProvider client={queryClient}
                // persistOptions={{ persister }}
                >
                  <Layouts />
                  {window.deferredPrompt && (
                    <button onClick={handleInstallClick}>Install App</button>
                  )}
                  {/* <ReactQueryDevtools initialIsOpen={false} /> */}
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