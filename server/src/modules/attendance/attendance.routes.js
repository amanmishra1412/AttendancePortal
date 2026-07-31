import express from 'express';
import {
  punchIn,
  punchOut,
  getTodayStatus,
  getAttendanceHistory,
} from './attendance.controller.js';
import { protect } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.get('/today', getTodayStatus);
router.get('/history', getAttendanceHistory);

export default router;
