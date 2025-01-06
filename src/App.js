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
import { indexedDB } from "state/services/indexedDB";
// import { store } from "../store";

const themes = {
  dark: `${process.env.PUBLIC_URL}/css/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/css/light-theme.css`,
};

(async () => {
  await indexedDB.init();
})();

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
  const queryClient = new QueryClient();
  // const persister = createAsyncStoragePersister({
  //   storage: AsyncStorage,
  // });

  return (
    <div className="App">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter history={history}>
            <ThemeSwitcherProvider themeMap={themes} defaultTheme={THEME_CONFIG.currentTheme} insertionPoint="styles-insertion-point" >
              <QueryClientProvider client={queryClient}
              // persistOptions={{ persister }}
              >
                <Layouts />
              </QueryClientProvider>
            </ThemeSwitcherProvider>
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </div>
  );
}

export default App;
