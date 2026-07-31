import mongoose from 'mongoose';
import { config } from '../config/index.js';

export const connectDB = async () => {
  try {
    // Disable buffering so queries fail or fallback instantly if DB connection fails
    mongoose.set('bufferCommands', false);
    
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Notice]: Database connection failed (${error.message}). Fix credentials in server/.env`);
  }
};
