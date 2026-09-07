import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Holiday name is required'],
      trim: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Holiday date (YYYY-MM-DD) is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Festival', 'National', 'Gazetted', 'Company', 'Restricted', 'Other'],
      default: 'Festival',
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    year: {
      type: Number,
      index: true,
    },
  },
  { timestamps: true }
);

holidaySchema.pre('save', function (next) {
  if (this.date && (!this.year || isNaN(this.year))) {
    const parts = this.date.split('-');
    if (parts.length >= 1) {
      this.year = parseInt(parts[0], 10);
    }
  }
  next();
});

holidaySchema.index({ date: 1 }, { unique: true });

export const Holiday = mongoose.model('Holiday', holidaySchema);
