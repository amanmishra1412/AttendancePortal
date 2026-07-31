import express from 'express';
import { getDashboardStats } from './dashboard.controller.js';
import { protect } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/stats', getDashboardStats);

export default router;
