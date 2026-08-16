import { User } from '../auth/user.model.js';
import { Attendance } from '../attendance/attendance.model.js';
import { Leave } from '../leave/leave.model.js';
import { Salary } from '../salary/salary.model.js';
import { Finance } from '../finance/finance.model.js';
import { autoPunchOutUnclosedAttendances } from '../../common/services/autoPunchOut.service.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    await autoPunchOutUnclosedAttendances();
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    if (req.user.role === 'Admin') {
      const totalEmployees = await User.countDocuments({ status: 'Active' });
      
      const todayAttendances = await Attendance.find({ date: todayStr });
      const presentToday = todayAttendances.filter((a) => a.status === 'Present').length;
      
      const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
      const pendingAdvances = await Finance.countDocuments({ status: 'Pending', type: 'Advance' });

      // Monthly Salary Expense Sum
      const currentMonthSalaries = await Salary.find({ month: currentMonth, year: currentYear });
      const totalSalaryExpense = currentMonthSalaries.reduce((sum, s) => sum + s.netSalary, 0);

      const absentToday = Math.max(0, totalEmployees - presentToday);

      return res.status(200).json({
        success: true,
        stats: {
          totalEmployees,
          presentToday,
          absentToday,
          pendingLeaves,
          pendingAdvances,
          totalSalaryExpense,
        },
      });
    } else {
      // Employee Dashboard stats
      const todayAttendance = await Attendance.findOne({ employee: req.user._id, date: todayStr });
      const employee = await User.findById(req.user._id);

      const pendingLeaves = await Leave.countDocuments({ employee: req.user._id, status: 'Pending' });
      const lastSalary = await Salary.findOne({ employee: req.user._id }).sort({ year: -1, month: -1 });

      return res.status(200).json({
        success: true,
        stats: {
          todayStatus: todayAttendance ? todayAttendance.status : 'Not Punched In',
          punchInTime: todayAttendance?.punchIn?.timestamp || null,
          punchOutTime: todayAttendance?.punchOut?.timestamp || null,
          paidLeaveQuota: employee.paidLeaveQuota,
          pendingLeaves,
          lastNetSalary: lastSalary ? lastSalary.netSalary : 0,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
