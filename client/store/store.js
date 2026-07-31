import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import attendanceReducer from './slices/attendanceSlice';
import employeeReducer from './slices/employeeSlice';
import leaveReducer from './slices/leaveSlice';
import salaryReducer from './slices/salarySlice';
import financeReducer from './slices/financeSlice';
import officeReducer from './slices/officeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    employee: employeeReducer,
    leave: leaveReducer,
    salary: salaryReducer,
    finance: financeReducer,
    office: officeReducer,
  },
});
