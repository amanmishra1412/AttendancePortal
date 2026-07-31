import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../shared/services/api';

export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (filters, { rejectWithValue }) => {
    try {
      const res = await api.get('/employees', { params: filters });
      return res.data.employees;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const createEmployeeAction = createAsyncThunk(
  'employee/createEmployee',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/employees', data);
      return res.data.employee;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create employee');
    }
  }
);

export const updateEmployeeAction = createAsyncThunk(
  'employee/updateEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/employees/${id}`, data);
      return res.data.employee;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update employee');
    }
  }
);

export const deleteEmployeeAction = createAsyncThunk(
  'employee/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/employees/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete employee');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState: {
    list: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearEmployeeStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createEmployeeAction.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.successMessage = 'Employee added successfully';
      })
      .addCase(createEmployeeAction.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateEmployeeAction.fulfilled, (state, action) => {
        const index = state.list.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
        state.successMessage = 'Employee details updated';
      })
      .addCase(deleteEmployeeAction.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e._id !== action.payload);
        state.successMessage = 'Employee record removed';
      });
  },
});

export const { clearEmployeeStatus } = employeeSlice.actions;
export default employeeSlice.reducer;
