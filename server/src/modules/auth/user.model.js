import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['Admin', 'Employee'],
      default: 'Employee',
    },
    department: {
      type: String,
      default: 'Engineering',
    },
    designation: {
      type: String,
      default: 'Software Engineer',
    },
    phone: {
      type: String,
      default: '',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    baseSalary: {
      type: Number,
      default: 50000,
    },
    hourlyRate: {
      type: Number,
      default: 300,
    },
    paidLeaveQuota: {
      type: Number,
      default: 18,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpire: {
      type: Date,
      select: false,
    },
    status: {
      type: String,
      enum: ['Pending_OTP', 'Pending_Approval', 'Active', 'Rejected'],
      default: 'Pending_OTP',
    },
    profileImage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
