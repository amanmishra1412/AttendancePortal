import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../shared/services/api';

export const fetchLeaves = createAsyncThunk('leave/fetchLeaves', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/leave', { params });
    return res.data.leaves;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch leaves');
  }
});

export const applyLeaveAction = createAsyncThunk('leave/applyLeave', async (leaveData, { rejectWithValue }) => {
  try {
    const res = await api.post('/leave', leaveData);
    return res.data.leave;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit leave request');
  }
});

export const updateLeaveStatusAction = createAsyncThunk(
  'leave/updateStatus',
  async ({ id, status, rejectionReason }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/leave/${id}/status`, { status, rejectionReason });
      return res.data.leave;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update leave status');
    }
  }
);

const leaveSlice = createSlice({
  name: 'leave',
  initialState: {
    list: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearLeaveStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(applyLeaveAction.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.successMessage = 'Leave request submitted successfully';
      })
      .addCase(applyLeaveAction.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateLeaveStatusAction.fulfilled, (state, action) => {
        const index = state.list.findIndex((l) => l._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
        state.successMessage = `Leave application ${action.payload.status.toLowerCase()}`;
      });
  },
});

export const { clearLeaveStatus } = leaveSlice.actions;
export default leaveSlice.reducer;
