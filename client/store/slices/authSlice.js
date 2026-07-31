import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../shared/services/api';

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const verifyOTPAction = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const resendOTPAction = createAsyncThunk(
  'auth/resendOTP',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Resend OTP failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return { token, user };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Login failed' });
    }
  }
);

export const fetchPendingApprovals = createAsyncThunk(
  'auth/fetchPendingApprovals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/pending-approvals');
      return response.data.users;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending approvals');
    }
  }
);

export const approveUserAction = createAsyncThunk(
  'auth/approveUser',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/auth/approve-user/${id}`, { status });
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Approval action failed');
    }
  }
);

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

const getInitialUser = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || null;
  }
  return null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getInitialUser(),
    token: getInitialToken(),
    pendingApprovals: [],
    loading: false,
    otpSent: false,
    otpVerified: false,
    unapprovedEmail: null,
    error: null,
    message: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.unapprovedEmail = action.payload.email;
        state.message = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOTPAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTPAction.fulfilled, (state, action) => {
        state.loading = false;
        state.otpVerified = true;
        state.message = action.payload.message;
      })
      .addCase(verifyOTPAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : action.payload.message;
      })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.pendingApprovals = action.payload;
      })
      .addCase(approveUserAction.fulfilled, (state, action) => {
        state.pendingApprovals = state.pendingApprovals.filter((u) => u._id !== action.payload._id);
        state.message = `Employee ${action.payload.name} has been ${action.payload.status.toLowerCase()}`;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
