import express from 'express';
import { getNotifications, markAsRead } from './notification.controller.js';
import { protect } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export default router;
