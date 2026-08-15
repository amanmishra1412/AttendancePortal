import mongoose from 'mongoose';

const attendanceRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: true,
    },
    requestedPunchIn: {
      type: Date,
      required: true,
    },
    requestedPunchOut: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adminRemarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

attendanceRequestSchema.index({ employee: 1, date: 1, status: 1 });

export const AttendanceRequest = mongoose.model('AttendanceRequest', attendanceRequestSchema);
