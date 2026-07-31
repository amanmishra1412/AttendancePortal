import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // If null or specific ref
    },
    targetRole: {
      type: String,
      enum: ['Admin', 'Employee', 'ALL'],
      default: 'Employee',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Leave', 'Salary', 'Finance', 'Attendance', 'System'],
      default: 'System',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
