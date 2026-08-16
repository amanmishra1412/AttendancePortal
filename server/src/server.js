import app from './app.js';
import { config } from './config/index.js';
import { connectDB } from './database/db.js';
import { initAutoPunchOutScheduler } from './common/services/autoPunchOut.service.js';

const startServer = async () => {
  await connectDB();

  // Initialize Automatic Day-End (23:59) Punch-Out Scheduler
  initAutoPunchOutScheduler();

  app.listen(config.port, () => {
    console.log(`=================================================`);
    console.log(`🚀 HRMS & Payroll Server running on port ${config.port}`);
    console.log(`🌐 Base URL: http://localhost:${config.port}/api`);
    console.log(`=================================================`);
  });
};

startServer();
