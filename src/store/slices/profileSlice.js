import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import service from "auth/FetchInterceptor";

export const initialState = {
  loading: false,
  userData: null,
  updateUserLoading: false,
  changePasswordLoading: false,
  updateTradeDefaultsLoading: false,
  getBrokerAccountsLoading: false,
  brokerAccounts: [],
  selectedAccount: null,
  getBrokerPortfoliosLoading: false,
  brokerPortfolios: [],
  selectedPortfolio: null,
  selectedDate: null,
};

export const getUserProfile = createAsyncThunk(
  "profile/user",
  async (_, { rejectWithValue }) => {
    try {
      const response = await service.get("/api/profile/user/");
      if (response.user) {
        return response.user;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await service.post("/api/profile/user/", payload);
      if (response?.user) {
        return response.user;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

export const changePassword = createAsyncThunk(
  "changePassword",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await service.post("/api/profile/user/change_password/", payload);
      if (response?.message) {
        return response.message;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

export const updateTradeDefaults = createAsyncThunk(
  "updateTradeDefaults",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await service.post("/api/profile/user/update_trade_default/", payload);
      if (response?.message) {
        return response.message;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

export const getBrokerPortfolios = createAsyncThunk(
  "profile/getBrokerPortfolios",
  async (brokerId, { rejectWithValue }) => {
    try {
      const response = await service.get(
        `/api/portfolios/all-portfolios/${brokerId}/`
      );
      if (response?.portfolios) {
        return response?.portfolios;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);
export const getBrokerAccounts = createAsyncThunk(
  "profile/getBrokerAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await service.get(
        `/api/accounts/all-accounts/`
      );
      if (response?.broker_accounts) {
        return response?.broker_accounts;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    selectAccount: (state, action) => {
      state.selectedAccount = action?.payload;
    },
    selectPortfolio: (state, action) => {
      state.selectedPortfolio = action?.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action?.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(getUserProfile.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateProfile.pending, (state) => {
        state.updateUserLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateUserLoading = false;
        state.userData = { ...state.userData, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state) => {
        state.updateUserLoading = false;
      })
      .addCase(changePassword.pending, (state) => {
        state.changePasswordLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordLoading = false;
      })
      .addCase(changePassword.rejected, (state) => {
        state.changePasswordLoading = false;
      })
      .addCase(updateTradeDefaults.pending, (state) => {
        state.updateTradeDefaultsLoading = true;
      })
      .addCase(updateTradeDefaults.fulfilled, (state) => {
        state.updateTradeDefaultsLoading = false;
      })
      .addCase(updateTradeDefaults.rejected, (state) => {
        state.updateTradeDefaultsLoading = false;
      })
      .addCase(getBrokerAccounts.pending, (state) => {
        state.getBrokerAccountsLoading = true;
      })
      .addCase(getBrokerAccounts.fulfilled, (state, action) => {
        state.getBrokerAccountsLoading = false;
        state.brokerAccounts = action.payload;
      })
      .addCase(getBrokerAccounts.rejected, (state) => {
        state.getBrokerAccountsLoading = false;
      })
      .addCase(getBrokerPortfolios.pending, (state) => {
        state.getBrokerPortfoliosLoading = true;
      })
      .addCase(getBrokerPortfolios.fulfilled, (state, action) => {
        state.getBrokerPortfoliosLoading = false;
        state.brokerPortfolios = action.payload;
      })
      .addCase(getBrokerPortfolios.rejected, (state) => {
        state.getBrokerPortfoliosLoading = false;
      });
  },
});


export const { selectPortfolio, selectAccount, setSelectedDate } = profileSlice.actions;

export default profileSlice.reducer;
