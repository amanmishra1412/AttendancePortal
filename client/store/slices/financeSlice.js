import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../shared/services/api';

export const fetchFinanceHistory = createAsyncThunk('finance/fetchHistory', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/finance', { params });
    return res.data.records;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch finance records');
  }
});

export const requestFinanceAction = createAsyncThunk('finance/request', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/finance', payload);
    return res.data.finance;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit finance request');
  }
});

export const updateFinanceStatusAction = createAsyncThunk(
  'finance/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/finance/${id}/status`, { status });
      return res.data.record;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update finance status');
    }
  }
);

const financeSlice = createSlice({
  name: 'finance',
  initialState: {
    list: [],
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearFinanceStatus: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinanceHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFinanceHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFinanceHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(requestFinanceAction.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.message = 'Finance request created successfully';
      })
      .addCase(updateFinanceStatusAction.fulfilled, (state, action) => {
        const index = state.list.findIndex((f) => f._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
        state.message = `Finance request ${action.payload.status.toLowerCase()}`;
      });
  },
});

export const { clearFinanceStatus } = financeSlice.actions;
export default financeSlice.reducer;
