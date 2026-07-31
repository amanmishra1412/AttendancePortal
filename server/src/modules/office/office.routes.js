import express from 'express';
import { getOfficeSettings, updateOfficeSettings } from './office.controller.js';
import { protect, authorize } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOfficeSettings)
  .put(authorize('Admin'), updateOfficeSettings);

export default router;
