import express from 'express';
import { applyLeave, getLeaves, updateLeaveStatus } from './leave.controller.js';
import { protect, authorize } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(applyLeave)
  .get(getLeaves);

router.patch('/:id/status', authorize('Admin'), updateLeaveStatus);

export default router;
