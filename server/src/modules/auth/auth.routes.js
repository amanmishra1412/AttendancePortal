import express from 'express';
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  getMe,
  getPendingApprovals,
  approveUser,
} from './auth.controller.js';
import { protect, authorize } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);

router.get('/me', protect, getMe);
router.get('/pending-approvals', protect, authorize('Admin'), getPendingApprovals);
router.patch('/approve-user/:id', protect, authorize('Admin'), approveUser);

export default router;
