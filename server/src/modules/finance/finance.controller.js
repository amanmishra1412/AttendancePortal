import { Finance } from './finance.model.js';
import { User } from '../auth/user.model.js';
import { Notification } from '../notification/notification.model.js';
import { logAudit } from '../../common/utils/auditLogger.js';

export const requestFinance = async (req, res, next) => {
  try {
    const { employeeId, type, amount, reason, repaymentMonths } = req.body;

    const targetEmployeeId = req.user.role === 'Admin' && employeeId ? employeeId : req.user._id;
    const employee = await User.findById(targetEmployeeId);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const months = repaymentMonths ? Number(repaymentMonths) : 1;
    const monthlyDeduction = type === 'Advance' ? Math.round(amount / months) : 0;

    const isAutoApproved = req.user.role === 'Admin';

    const record = await Finance.create({
      employee: targetEmployeeId,
      type,
      amount,
      reason,
      repaymentMonths: months,
      monthlyDeduction,
      status: isAutoApproved ? 'Approved' : 'Pending',
      approvedBy: isAutoApproved ? req.user._id : undefined,
    });

    if (req.user.role === 'Admin') {
      await Notification.create({
        recipient: targetEmployeeId,
        title: `${type} Issued by Admin`,
        message: `Admin issued ${type} of ₹${amount.toLocaleString()} to your account`,
        type: 'Finance',
      });
    } else {
      await Notification.create({
        targetRole: 'Admin',
        title: `New ${type} Request`,
        message: `${req.user.name} requested ${type} of ₹${amount.toLocaleString()}`,
        type: 'Finance',
      });
    }

    await logAudit({
      user: req.user._id,
      action: `GRANT_${type.toUpperCase()}`,
      module: 'Finance',
      details: `${req.user.role === 'Admin' ? 'Admin issued' : 'Requested'} ${type} of ₹${amount} for ${employee.name}`,
      req,
    });

    res.status(201).json({ success: true, message: `${type} record created successfully`, finance: record });
  } catch (error) {
    next(error);
  }
};

export const getFinanceHistory = async (req, res, next) => {
  try {
    const { type, status, employeeId } = req.query;
    let query = {};

    if (req.user.role === 'Employee') {
      query.employee = req.user._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (type) query.type = type;
    if (status) query.status = status;

    const records = await Finance.find(query)
      .populate('employee', 'name employeeId email department designation baseSalary')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

export const updateFinanceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const record = await Finance.findById(req.params.id).populate('employee');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Finance record not found' });
    }

    record.status = status;
    record.approvedBy = req.user._id;
    await record.save();

    await Notification.create({
      recipient: record.employee._id,
      title: `${record.type} Request ${status}`,
      message: `Your ${record.type} request of ₹${record.amount} has been ${status.toLowerCase()}`,
      type: 'Finance',
    });

    await logAudit({
      user: req.user._id,
      action: `FINANCE_${status.toUpperCase()}`,
      module: 'Finance',
      details: `Updated ${record.type} status to ${status} for ${record.employee.name}`,
      req,
    });

    res.status(200).json({ success: true, message: `Status updated to ${status}`, record });
  } catch (error) {
    next(error);
  }
};
