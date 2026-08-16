import mongoose from 'mongoose';

const officeSettingsSchema = new mongoose.Schema(
  {
    officeName: {
      type: String,
      default: 'Headquarters',
    },
    latitude: {
      type: Number,
      default: 28.6139, // Default New Delhi coordinates for demonstration
    },
    longitude: {
      type: Number,
      default: 77.209,
    },
    allowedRadiusMeters: {
      type: Number,
      default: 500, // 500 meters allowed radius
    },
    workStartTime: {
      type: String,
      default: '10:00', // 10:00 AM (24-hr format)
    },
    workEndTime: {
      type: String,
      default: '19:00', // 07:00 PM (24-hr format)
    },
    graceTimeMinutes: {
      type: Number,
      default: 0,
    },
    overtimeRateMultiplier: {
      type: Number,
      default: 1.5,
    },
    lateDeductionPerMinute: {
      type: Number,
      default: 0,
    },
    earlyExitDeductionPerMinute: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const OfficeSettings = mongoose.model('OfficeSettings', officeSettingsSchema);
