import mongoose from 'mongoose';

const financeSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['Advance', 'Bonus', 'Reimbursement', 'Deduction'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    repaymentMonths: {
      type: Number,
      default: 1, // Number of months to divide advance repayment
    },
    monthlyDeduction: {
      type: Number,
      default: 0,
    },
    recoveredAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Recovered'],
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Finance = mongoose.model('Finance', financeSchema);
