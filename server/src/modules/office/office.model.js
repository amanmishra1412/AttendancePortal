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
      default: '09:00', // 24-hr format
    },
    workEndTime: {
      type: String,
      default: '18:00',
    },
    graceTimeMinutes: {
      type: Number,
      default: 15,
    },
    overtimeRateMultiplier: {
      type: Number,
      default: 1.5,
    },
    lateDeductionPerMinute: {
      type: Number,
      default: 5,
    },
    earlyExitDeductionPerMinute: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

export const OfficeSettings = mongoose.model('OfficeSettings', officeSettingsSchema);
