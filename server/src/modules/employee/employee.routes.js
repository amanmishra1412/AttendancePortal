import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from './employee.controller.js';
import { protect, authorize } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEmployees)
  .post(authorize('Admin'), createEmployee);

router.route('/:id')
  .get(getEmployeeById)
  .put(authorize('Admin'), updateEmployee)
  .delete(authorize('Admin'), deleteEmployee);

export default router;
