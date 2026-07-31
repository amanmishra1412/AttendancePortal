import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../shared/services/api';

export const fetchTodayAttendance = createAsyncThunk(
  'attendance/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/attendance/today');
      return res.data.attendance;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch today status');
    }
  }
);

export const punchInAction = createAsyncThunk(
  'attendance/punchIn',
  async (coords, { rejectWithValue }) => {
    try {
      const res = await api.post('/attendance/punch-in', coords);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Punch in failed');
    }
  }
);

export const punchOutAction = createAsyncThunk(
  'attendance/punchOut',
  async (coords, { rejectWithValue }) => {
    try {
      const res = await api.post('/attendance/punch-out', coords);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Punch out failed');
    }
  }
);

export const fetchAttendanceHistory = createAsyncThunk(
  'attendance/fetchHistory',
  async (filters, { rejectWithValue }) => {
    try {
      const res = await api.get('/attendance/history', { params: filters });
      return res.data.history;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch history');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    today: null,
    history: [],
    loading: false,
    punching: false,
    message: null,
    error: null,
  },
  reducers: {
    clearAttendanceMessage: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.today = action.payload;
      })
      .addCase(punchInAction.pending, (state) => {
        state.punching = true;
        state.error = null;
      })
      .addCase(punchInAction.fulfilled, (state, action) => {
        state.punching = false;
        state.today = action.payload.attendance;
        state.message = action.payload.message;
      })
      .addCase(punchInAction.rejected, (state, action) => {
        state.punching = false;
        state.error = action.payload;
      })
      .addCase(punchOutAction.pending, (state) => {
        state.punching = true;
        state.error = null;
      })
      .addCase(punchOutAction.fulfilled, (state, action) => {
        state.punching = false;
        state.today = action.payload.attendance;
        state.message = action.payload.message;
      })
      .addCase(punchOutAction.rejected, (state, action) => {
        state.punching = false;
        state.error = action.payload;
      })
      .addCase(fetchAttendanceHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttendanceHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchAttendanceHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttendanceMessage } = attendanceSlice.actions;
export default attendanceSlice.reducer;
