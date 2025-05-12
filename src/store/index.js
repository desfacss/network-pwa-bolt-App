


import rootReducer from "./rootReducer";
import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import thunk from "redux-thunk";
import { supabase } from "configs/SupabaseConfig";
import { setSession, removeSession } from "./slices/authSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Middleware to validate token on rehydration
const tokenValidationMiddleware = (store) => (next) => (action) => {
  if (action.type === "persist/REHYDRATE" && action.payload?.auth) {
    const { session } = action.payload.auth;
    if (session?.access_token) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > session.expires_at) {
        supabase.auth.refreshSession({ refresh_token: session.refresh_token })
          .then(({ data, error }) => {
            if (error || !data.session) {
              store.dispatch(removeSession());
              localStorage.removeItem("persist:root");
              localStorage.removeItem("AUTH_TOKEN");
            } else {
              store.dispatch(setSession(data.session));
            }
          });
      }
    }
  }
  return next(action);
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk, tokenValidationMiddleware],
  devTools: process.env.NODE_ENV === "development",
});

export const persistor = persistStore(store);
