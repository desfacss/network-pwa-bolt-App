import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import service from "auth/FetchInterceptor";

function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export const initialState = {
  positions: [],
  getPositionsLoading: false,
  positionsSummary: [],
  getPositionsSummaryLoading: false,
  squareOffLoading: false,
  slTradeLoading: false,
  targetTradeLoading: false,
  user: {}
};


export const getPositions = createAsyncThunk(
  "positions/positions",
  async (payload, { rejectWithValue }) => {
    try {
      // const date = getCurrentDate();
      // const response = await service.get(`/api/position/portfolio-bots/${portfolioId}/?start_date=${date}`);
      // const response = await service.get(`/api/position/position/${portfolioId}/?start_date=${date}`);
      const startDate = payload?.date ? '?start_date=' + payload?.date : ''
      const response = await service.get(`/api/position/position/${payload?.portfolioId}/${startDate}`);
      console.log("Positions Response", response)
      if (response?.data) {
        return response?.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

export const setUser = createAsyncThunk(
  "positions/user",
  async (payload, { rejectWithValue }) => {
    return { ...payload?.user, access_token: payload?.session?.access_token }
  }
);

export const getPositionsSummary = createAsyncThunk(
  "positions/summary",
  async (portfolioId, { rejectWithValue }) => {
    try {
      const response = await service.get(`/api/position/summary/${portfolioId}/?start_date=2023-08-10/`);
      if (response) {
        return response;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

export const squareOff = createAsyncThunk(
  "positions/squareOff",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await service.post(`/api/order-book/order-book/squareoff_trades/`, payload);
      if (response) {
        return response;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

export const slTrade = createAsyncThunk(
  "positions/slTrade",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await service.post(`/api/order-book/order-book/place_slorder/`, payload);
      if (response) {
        return response;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

export const targetTrade = createAsyncThunk(
  "positions/targetTrade",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await service.post(`/api/order-book/order-book/place_targetorder/`, payload);
      if (response) {
        return response;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (err) {
      return rejectWithValue(err.message || "Error");
    }
  }
);

export const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPositions.pending, (state) => {
        state.getPositionsLoading = true;
      })
      .addCase(getPositions.fulfilled, (state, action) => {
        state.getPositionsLoading = false;
        state.positions = action.payload;
      })
      .addCase(getPositions.rejected, (state) => {
        state.getPositionsLoading = false;
      })
      .addCase(getPositionsSummary.pending, (state) => {
        state.getPositionsSummaryLoading = true;
      })
      .addCase(getPositionsSummary.fulfilled, (state, action) => {
        state.getPositionsSummaryLoading = false;
        state.positionsSummary = action.payload;
      })
      .addCase(getPositionsSummary.rejected, (state) => {
        state.getPositionsSummaryLoading = false;
      })
      .addCase(squareOff.pending, (state) => {
        state.squareOffLoading = true;
      })
      .addCase(squareOff.fulfilled, (state, action) => {
        state.squareOffLoading = false;
      })
      .addCase(squareOff.rejected, (state) => {
        state.squareOffLoading = false;
      })
      .addCase(slTrade.pending, (state) => {
        state.slTradeLoading = true;
      })
      .addCase(slTrade.fulfilled, (state, action) => {
        state.slTradeLoading = false;
      })
      .addCase(slTrade.rejected, (state) => {
        state.slTradeLoading = false;
      })
      .addCase(targetTrade.pending, (state) => {
        state.targetTradeLoading = true;
      })
      .addCase(targetTrade.fulfilled, (state, action) => {
        state.targetTradeLoading = false;
      })
      .addCase(targetTrade.rejected, (state) => {
        state.targetTradeLoading = false;
      })
      .addCase(setUser.fulfilled, (state, action) => {
        state.user = action?.payload;
      });
  },
});

export default positionsSlice.reducer;
