import express from 'express';
import { requestFinance, getFinanceHistory, updateFinanceStatus } from './finance.controller.js';
import { protect, authorize } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(requestFinance)
  .get(getFinanceHistory);

router.patch('/:id/status', authorize('Admin'), updateFinanceStatus);

export default router;
