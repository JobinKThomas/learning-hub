import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from './dashboardApi';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getDashboardData();
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to fetch dashboard data';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch dashboard data';
      });
  },
});

export const { clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
