import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler } from './common/middleware/error.middleware.js';

import authRoutes from './modules/auth/auth.routes.js';
import employeeRoutes from './modules/employee/employee.routes.js';
import officeRoutes from './modules/office/office.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import leaveRoutes from './modules/leave/leave.routes.js';
import financeRoutes from './modules/finance/finance.routes.js';
import salaryRoutes from './modules/salary/salary.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Attendance & Payroll API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/office', officeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);

// Error Middleware
app.use(errorHandler);

export default app;
