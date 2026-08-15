import express from 'express';
import {
  punchIn,
  punchOut,
  getTodayStatus,
  getAttendanceHistory,
  submitRegularizationRequest,
  getRegularizationRequests,
  reviewRegularizationRequest,
} from './attendance.controller.js';
import { protect, authorize } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.get('/today', getTodayStatus);
router.get('/history', getAttendanceHistory);

router.post('/regularize', submitRegularizationRequest);
router.get('/regularization-requests', getRegularizationRequests);
router.patch('/regularize/:id', authorize('Admin'), reviewRegularizationRequest);

export default router;

