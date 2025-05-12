

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "configs/SupabaseConfig";
import service from "auth/FetchInterceptor";
import { REACT_APP_WORKSPACE } from "configs/AppConfig";
import { AUTH_TOKEN } from "constants/AuthConstant";

export const initialState = {
  loading: false,
  message: "",
  showMessage: false,
  redirect: "",
  token: localStorage.getItem(AUTH_TOKEN) || null,
  session: null,
  selectedOrganization: null,
  selectedUser: null,
  defaultOrganization: null,
};

// Fetch the default organization
export const fetchDefaultOrganization = createAsyncThunk(
  "auth/fetchDefaultOrganization",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const { session } = getState().auth;
    const currentTime = Math.floor(Date.now() / 1000);

    if (session?.access_token) {
      if (currentTime > session.expires_at) {
        console.log("Token expired, refreshing...");
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: session.refresh_token,
        });
        if (error || !data.session) {
          console.log("Refresh failed:", error);
          dispatch(removeSession());
          localStorage.removeItem(AUTH_TOKEN);
          return rejectWithValue("Session expired and could not be refreshed");
        }
        dispatch(setSession(data.session));
      }

      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("app_settings->>workspace", REACT_APP_WORKSPACE || "dev")
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Org fetch error:", err);
        return rejectWithValue(err.message); // Don’t clear session unless critical
      }
    } else {
      return rejectWithValue("No valid session");
    }
  }
);

// Sign in with custom API (not Supabase auth)
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (data, { rejectWithValue }) => {
    const { email, password } = data;
    try {
      const response = await service.post("/api/authenticate/login/", {
        email,
        password,
      });
      if (response.user) {
        const token = response.token;
        localStorage.setItem(AUTH_TOKEN, token);
        return token;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

// Sign up with custom API
export const signUp = createAsyncThunk(
  "auth/signUp",
  async (data, { rejectWithValue }) => {
    const { email, password, name, mobile } = data;
    try {
      const response = await service.post("/api/authenticate/register/", {
        email,
        password,
        name,
        mobile,
      });
      if (!response.user) {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

// Sign out
// export const signOut = createAsyncThunk(
//   "auth/signOut",
//   async (_, { dispatch }) => {
//     await supabase.auth.signOut(); // Clear Supabase session supabase.auth.signOut({ scope: "local" });
//     localStorage.removeItem(AUTH_TOKEN);
//     dispatch(removeSession());
//     return true;
//   }
// );


export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { dispatch }) => {
    await supabase.auth.signOut({ scope: "local" }); // Clear Supabase session supabase.auth.signOut({ scope: "local" });
    localStorage.removeItem(AUTH_TOKEN);
    // dispatch(removeSession());
    dispatch(setSession());
    return true;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authenticated: (state, action) => {
      state.loading = false;
      state.redirect = "/";
      state.token = action.payload;
    },
    showAuthMessage: (state, action) => {
      state.message = action.payload;
      state.showMessage = true;
      state.loading = false;
    },
    hideAuthMessage: (state) => {
      state.message = "";
      state.showMessage = false;
    },
    signOutSuccess: (state) => {
      state.loading = false;
      state.token = null;
      state.session = null;
      state.redirect = "/app/login";
    },
    showLoading: (state) => {
      state.loading = true;
    },
    signInSuccess: (state, action) => {
      state.loading = false;
      state.token = action.payload;
    },
    setSession: (state, action) => {
      state.session = action.payload;
    },
    removeSession: (state) => {
      state.session = null;
      state.token = null;
      state.redirect = "/app/login";
    },
    setSelectedOrganization: (state, action) => {
      state.selectedOrganization = action.payload;
    },
    removeSelectedOrganization: (state) => {
      state.selectedOrganization = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    removeSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDefaultOrganization.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDefaultOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultOrganization = action.payload;
      })
      .addCase(fetchDefaultOrganization.rejected, (state, action) => {
        state.loading = false;
        state.message = action.payload;
        if (action.payload === "Session expired and could not be refreshed") {
          state.session = null;
          state.token = null;
          state.redirect = "/app/login";
        }
      })
      .addCase(signIn.pending, (state) => {
        state.loading = true;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.redirect = "/";
        state.token = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.message = action.payload;
        state.showMessage = true;
        state.loading = false;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.token = null;
        state.session = null;
        state.redirect = "/app/login";
      })
      .addCase(signOut.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.session = null;
        state.redirect = "/app/login";
      })
      .addCase(signUp.pending, (state) => {
        state.loading = true;
      })
      .addCase(signUp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.message = action.payload;
        state.showMessage = true;
        state.loading = false;
      });
  },
});

export const {
  authenticated,
  showAuthMessage,
  hideAuthMessage,
  signOutSuccess,
  showLoading,
  signInSuccess,
  setSession,
  setSelectedOrganization,
  setSelectedUser,
  removeSession,
} = authSlice.actions;

export default authSlice.reducer;
