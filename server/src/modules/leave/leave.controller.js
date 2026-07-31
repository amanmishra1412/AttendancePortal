import { Leave } from './leave.model.js';
import { User } from '../auth/user.model.js';
import { Notification } from '../notification/notification.model.js';
import { logAudit } from '../../common/utils/auditLogger.js';

export const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date' });
    }

    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      status: 'Pending',
    });

    // Send notification to Admins
    await Notification.create({
      targetRole: 'Admin',
      title: 'New Leave Request',
      message: `${req.user.name} applied for ${totalDays} day(s) ${leaveType} leave`,
      type: 'Leave',
    });

    await logAudit({
      user: req.user._id,
      action: 'APPLY_LEAVE',
      module: 'Leave',
      details: `Applied for ${totalDays} days leave (${leaveType})`,
      req,
    });

    res.status(201).json({ success: true, message: 'Leave application submitted', leave });
  } catch (error) {
    next(error);
  }
};

export const getLeaves = async (req, res, next) => {
  try {
    const { status, employeeId } = req.query;
    let query = {};

    if (req.user.role === 'Employee') {
      query.employee = req.user._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (status) query.status = status;

    const leaves = await Leave.find(query)
      .populate('employee', 'name employeeId email department designation paidLeaveQuota')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const leaveId = req.params.id;

    const leave = await Leave.findById(leaveId).populate('employee');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    if (rejectionReason) leave.rejectionReason = rejectionReason;

    await leave.save();

    // If approved and leaveType is Paid, deduct quota
    if (status === 'Approved' && leave.leaveType === 'Paid') {
      const employee = await User.findById(leave.employee._id);
      if (employee) {
        employee.paidLeaveQuota = Math.max(0, employee.paidLeaveQuota - leave.totalDays);
        await employee.save();
      }
    }

    // Send notification to Employee
    await Notification.create({
      recipient: leave.employee._id,
      title: `Leave ${status}`,
      message: `Your request for ${leave.totalDays} day(s) leave has been ${status.toLowerCase()}`,
      type: 'Leave',
    });

    await logAudit({
      user: req.user._id,
      action: `LEAVE_${status.toUpperCase()}`,
      module: 'Leave',
      details: `${status} leave for ${leave.employee.name}`,
      req,
    });

    res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()} successfully`, leave });
  } catch (error) {
    next(error);
  }
};
