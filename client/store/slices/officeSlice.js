import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../shared/services/api';

export const fetchOfficeSettings = createAsyncThunk('office/fetchSettings', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/office');
    return res.data.settings;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch office settings');
  }
});

export const updateOfficeSettingsAction = createAsyncThunk('office/updateSettings', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/office', data);
    return res.data.settings;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update office settings');
  }
});

const officeSlice = createSlice({
  name: 'office',
  initialState: {
    settings: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearOfficeStatus: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOfficeSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(updateOfficeSettingsAction.fulfilled, (state, action) => {
        state.settings = action.payload;
        state.message = 'Office settings & GPS geofence updated';
      });
  },
});

export const { clearOfficeStatus } = officeSlice.actions;
export default officeSlice.reducer;
