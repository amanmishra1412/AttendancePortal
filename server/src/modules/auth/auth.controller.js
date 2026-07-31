import jwt from 'jsonwebtoken';
import { User } from './user.model.js';
import { config } from '../../config/index.js';
import { logAudit } from '../../common/utils/auditLogger.js';
import { sendOTPEmail, sendApprovalNotificationEmail } from '../../common/services/email.service.js';

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, department, designation, baseSalary } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const emailLower = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailLower });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    const employeeId = `EMP-${Math.floor(100 + Math.random() * 900)}`;

    const newUser = await User.create({
      employeeId,
      name,
      email: emailLower,
      password,
      phone: phone || '',
      department: department || 'Engineering',
      designation: designation || 'Software Associate',
      baseSalary: baseSalary || 50000,
      isEmailVerified: false,
      otp,
      otpExpire,
      status: 'Pending_OTP',
    });

    // Send Real OTP Email via Nodemailer
    await sendOTPEmail({ to: emailLower, name, otp });

    res.status(201).json({
      success: true,
      message: 'Account created! A 6-digit verification OTP has been sent to your email address.',
      email: emailLower,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const emailLower = email.toLowerCase().trim();

    const user = await User.findOne({ email: emailLower }).select('+otp +otpExpire');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit OTP code' });
    }

    user.isEmailVerified = true;
    user.status = 'Pending_Approval';
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    await logAudit({
      user: user._id,
      action: 'VERIFY_OTP',
      module: 'Auth',
      details: `User ${user.email} completed email OTP verification`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Your account is now submitted to Admin for approval.',
      status: 'Pending_Approval',
    });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const emailLower = email.toLowerCase().trim();

    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    await sendOTPEmail({ to: emailLower, name: user.name, otp });

    res.status(200).json({
      success: true,
      message: 'A new 6-digit verification code has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check verification & approval status
    if (user.status === 'Pending_OTP' || !user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your email address is not verified yet. Please verify your OTP code.',
        requiresOTP: true,
        email: user.email,
      });
    }

    if (user.status === 'Pending_Approval') {
      return res.status(403).json({
        success: false,
        message: 'Your email is verified! Waiting for Admin Approval before you can log in.',
        pendingApproval: true,
      });
    }

    if (user.status === 'Rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your registration request was rejected by Admin.',
      });
    }

    const token = generateToken(user._id);

    await logAudit({
      user: user._id,
      action: 'LOGIN',
      module: 'Auth',
      details: `User ${user.email} (${user.role}) logged in successfully`,
      req,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        baseSalary: user.baseSalary,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingApprovals = async (req, res, next) => {
  try {
    const pendingUsers = await User.find({ status: 'Pending_Approval' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: pendingUsers.length, users: pendingUsers });
  } catch (error) {
    next(error);
  }
};

export const approveUser = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Active' or 'Rejected'
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    user.isEmailVerified = true;
    await user.save();

    // Send email notification to employee
    await sendApprovalNotificationEmail({ to: user.email, name: user.name, status });

    await logAudit({
      user: req.user._id,
      action: `USER_REGISTRATION_${status.toUpperCase()}`,
      module: 'Auth',
      details: `Admin ${status.toLowerCase()} employee ${user.email}`,
      req,
    });

    res.status(200).json({ success: true, message: `Employee account ${status.toLowerCase()} successfully`, user });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
