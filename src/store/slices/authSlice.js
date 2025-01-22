import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "api/supabaseClient";
import service from "auth/FetchInterceptor";
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

// Async thunk to fetch the default organization where name === 'dev'
export const fetchDefaultOrganization = createAsyncThunk(
  "auth/fetchDefaultOrganization",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("app_settings->>workspace", process.env.REACT_APP_WORKSPACE || 'dev')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

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
      } else {
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  localStorage.removeItem(AUTH_TOKEN);
  return true;
});

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
      state.redirect = "/";
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
        state.redirect = "/";
      })
      .addCase(signOut.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.redirect = "/";
      })
      .addCase(signUp.pending, (state) => {
        state.loading = true;
      })
      .addCase(signUp.fulfilled, (state, action) => {
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
  removeSession
} = authSlice.actions;

export default authSlice.reducer;
