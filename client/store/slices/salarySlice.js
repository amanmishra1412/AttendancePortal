import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../shared/services/api';

export const fetchSalaries = createAsyncThunk('salary/fetchSalaries', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/salary', { params });
    return res.data.salaries;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch salary records');
  }
});

export const generateSalaryAction = createAsyncThunk('salary/generate', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/salary/generate', payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to generate salary');
  }
});

const salarySlice = createSlice({
  name: 'salary',
  initialState: {
    list: [],
    loading: false,
    generating: false,
    error: null,
    message: null,
  },
  reducers: {
    clearSalaryStatus: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalaries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalaries.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSalaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generateSalaryAction.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateSalaryAction.fulfilled, (state, action) => {
        state.generating = false;
        state.message = action.payload.message;
      })
      .addCase(generateSalaryAction.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      });
  },
});

export const { clearSalaryStatus } = salarySlice.actions;
export default salarySlice.reducer;
