import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_payroll_db',
  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '"AttendancePro HRMS" <noreply@company.com>',
  },
};
