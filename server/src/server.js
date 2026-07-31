import app from './app.js';
import { config } from './config/index.js';
import { connectDB } from './database/db.js';

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`=================================================`);
    console.log(`🚀 HRMS & Payroll Server running on port ${config.port}`);
    console.log(`🌐 Base URL: http://localhost:${config.port}/api`);
    console.log(`=================================================`);
  });
};

startServer();
