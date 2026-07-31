import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
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
    punchIn: {
      timestamp: Date,
      latitude: Number,
      longitude: Number,
      distanceMeters: Number,
      isVerifiedGPS: Boolean,
      status: {
        type: String,
        enum: ['On Time', 'Late'],
        default: 'On Time',
      },
    },
    punchOut: {
      timestamp: Date,
      latitude: Number,
      longitude: Number,
      distanceMeters: Number,
      isVerifiedGPS: Boolean,
      status: {
        type: String,
        enum: ['On Time', 'Early Exit'],
        default: 'On Time',
      },
    },
    expectedPunchOutTime: Date, // Punch In + 9 Hours
    totalWorkingMinutes: {
      type: Number,
      default: 0,
    },
    overtimeMinutes: {
      type: Number,
      default: 0,
    },
    shortfallMinutes: {
      type: Number,
      default: 0,
    },
    isSunday: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half-Day', 'On-Leave', 'Holiday'],
      default: 'Present',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
