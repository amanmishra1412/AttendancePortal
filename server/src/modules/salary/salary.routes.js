import express from 'express';
import { generateSalary, getSalaries, downloadSalaryPDF } from './salary.controller.js';
import { protect, authorize } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate', authorize('Admin'), generateSalary);
router.get('/', getSalaries);
router.get('/:id/pdf', downloadSalaryPDF);

export default router;
