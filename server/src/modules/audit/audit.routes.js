import express from 'express';
import { getAuditLogs } from './audit.controller.js';
import { protect, authorize } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('Admin'), getAuditLogs);

export default router;
