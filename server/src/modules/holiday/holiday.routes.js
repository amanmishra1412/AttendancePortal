import express from 'express';
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  seedDefaultHolidays,
} from './holiday.controller.js';
import { protect, authorize } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getHolidays);
router.post('/', authorize('Admin'), createHoliday);
router.post('/seed', authorize('Admin'), seedDefaultHolidays);
router.put('/:id', authorize('Admin'), updateHoliday);
router.delete('/:id', authorize('Admin'), deleteHoliday);

export default router;
