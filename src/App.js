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
// import { store } from "../store";

const themes = {
  dark: `${process.env.PUBLIC_URL}/css/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/css/light-theme.css`,
};

function App() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // setSession(session)
      store.dispatch(setSession(session));
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // setSession(session)
      console.log("Supabase Event", _event, session)
      store.dispatch(setSession(session));
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <div className="App">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter history={history}>
            <ThemeSwitcherProvider
              themeMap={themes}
              defaultTheme={THEME_CONFIG.currentTheme}
              insertionPoint="styles-insertion-point"
            >
              <Layouts />
            </ThemeSwitcherProvider>
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </div>
  );
}

export default App;
