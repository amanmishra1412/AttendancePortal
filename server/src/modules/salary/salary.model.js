import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number, // 1-12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
    },
    dailyRate: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    minuteRate: {
      type: Number,
      default: 0,
    },
    presentDays: {
      type: Number,
      default: 0,
    },
    absentDays: {
      type: Number,
      default: 0,
    },
    sundayWorkingDays: {
      type: Number,
      default: 0,
    },
    overtimeMinutes: {
      type: Number,
      default: 0,
    },
    overtimePay: {
      type: Number,
      default: 0,
    },
    shortfallMinutes: {
      type: Number,
      default: 0,
    },
    shortfallDeduction: {
      type: Number,
      default: 0,
    },
    absenceDeduction: {
      type: Number,
      default: 0,
    },
    sundayPay: {
      type: Number,
      default: 0,
    },
    advanceDeduction: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Generated', 'Paid'],
      default: 'Generated',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export const Salary = mongoose.model('Salary', salarySchema);
