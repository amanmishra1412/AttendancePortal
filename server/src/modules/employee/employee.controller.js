import { User } from '../auth/user.model.js';
import { logAudit } from '../../common/utils/auditLogger.js';

export const getEmployees = async (req, res, next) => {
  try {
    const { search, department, role } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) query.department = department;
    if (role) query.role = role;

    const employees = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: employees.length, employees });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const { employeeId, name, email, password, role, department, designation, phone, baseSalary, hourlyRate } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Employee ID or Email already exists' });
    }

    const employee = await User.create({
      employeeId,
      name,
      email,
      password: password || '123456',
      role: role || 'Employee',
      department: department || 'Engineering',
      designation: designation || 'Software Engineer',
      phone,
      baseSalary: baseSalary || 50000,
      hourlyRate: hourlyRate || 300,
      status: 'Active',
      isEmailVerified: true,
    });

    await logAudit({
      user: req.user._id,
      action: 'CREATE_EMPLOYEE',
      module: 'Employee',
      details: `Created employee ${employee.name} (${employee.employeeId})`,
      req,
    });

    res.status(201).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await logAudit({
      user: req.user._id,
      action: 'UPDATE_EMPLOYEE',
      module: 'Employee',
      details: `Updated employee ${employee.name} (${employee.employeeId})`,
      req,
    });

    res.status(200).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await logAudit({
      user: req.user._id,
      action: 'DELETE_EMPLOYEE',
      module: 'Employee',
      details: `Deleted employee ID ${req.params.id}`,
      req,
    });

    res.status(200).json({ success: true, message: 'Employee removed successfully' });
  } catch (error) {
    next(error);
  }
};
