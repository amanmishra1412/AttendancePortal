import PDFDocument from 'pdfkit';
import { Salary } from './salary.model.js';
import { User } from '../auth/user.model.js';
import { Attendance } from '../attendance/attendance.model.js';
import { Finance } from '../finance/finance.model.js';
import { Holiday } from '../holiday/holiday.model.js';
import { Leave } from '../leave/leave.model.js';
import { logAudit } from '../../common/utils/auditLogger.js';
import { autoPunchOutUnclosedAttendances } from '../../common/services/autoPunchOut.service.js';
import { getISTDayOfWeek } from '../../common/utils/timezone.js';

export const generateSalary = async (req, res, next) => {
  try {
    await autoPunchOutUnclosedAttendances();
    const { month, year, employeeId } = req.body;

    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const monthPrefix = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

    let employees = [];
    if (employeeId) {
      const emp = await User.findById(employeeId);
      if (emp) employees.push(emp);
    } else {
      employees = await User.find({ status: 'Active', role: 'Employee' });
    }

    // Fetch Paid Holidays for Target Month
    const holidays = await Holiday.find({
      date: { $regex: `^${monthPrefix}` },
      isPaid: true,
    });
    const holidayDateMap = {};
    holidays.forEach((h) => {
      holidayDateMap[h.date] = h;
    });

    // Calculate Sundays and Holidays in Month
    let sundaysCount = 0;
    let holidaysCount = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSun = getISTDayOfWeek(dStr) === 0;
      if (isSun) {
        sundaysCount++;
      } else if (holidayDateMap[dStr]) {
        holidaysCount++;
      }
    }

    const workingDays = Math.max(0, daysInMonth - sundaysCount - holidaysCount);

    const generatedSalaries = [];

    for (const emp of employees) {
      const baseSalary = emp.baseSalary || 50000;

      // Exact Formula Calculations
      const dailyRate = Math.round((baseSalary / 30) * 100) / 100;
      const hourlyRate = Math.round((dailyRate / 9) * 100) / 100;
      const minuteRate = Math.round((hourlyRate / 60) * 10000) / 10000; // High precision minute rate

      // Fetch Attendance Logs for Month
      const attendances = await Attendance.find({
        employee: emp._id,
        date: { $regex: `^${monthPrefix}` },
      });

      let presentDays = 0;
      let sundayWorkingDays = 0;
      let totalOvertimeMinutes = 0;
      let totalShortfallMinutes = 0;
      let totalSundayMinutes = 0;

      attendances.forEach((a) => {
        if (a.isSunday) {
          if (a.punchIn?.timestamp) {
            sundayWorkingDays += 1;
            totalSundayMinutes += a.totalWorkingMinutes || 0;
          }
        } else {
          if (a.status === 'Present') {
            presentDays += 1;
            totalOvertimeMinutes += a.overtimeMinutes || 0;
            totalShortfallMinutes += a.shortfallMinutes || 0;
          }
        }
      });

      // Fetch approved Paid/Sick/Casual leaves for employee in this month
      const startOfMonth = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0);
      const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

      const approvedLeaves = await Leave.find({
        employee: emp._id,
        status: 'Approved',
        leaveType: { $in: ['Paid', 'Sick', 'Casual'] },
        $or: [
          { startDate: { $lte: endOfMonth }, endDate: { $gte: startOfMonth } },
        ],
      });

      // Calculate paid leave days falling on regular working days in this month
      let paidLeaveDays = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const dStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isSun = getISTDayOfWeek(dStr) === 0;
        const isHol = !!holidayDateMap[dStr];
        // Only count leave if it's a regular working day (not already Sunday or Holiday)
        if (!isSun && !isHol) {
          const currentDayDate = new Date(targetYear, targetMonth - 1, day, 12, 0, 0);
          const hasLeave = approvedLeaves.some((l) => {
            const lStart = new Date(l.startDate);
            lStart.setHours(0, 0, 0, 0);
            const lEnd = new Date(l.endDate);
            lEnd.setHours(23, 59, 59, 999);
            return currentDayDate >= lStart && currentDayDate <= lEnd;
          });
          if (hasLeave) {
            paidLeaveDays++;
          }
        }
      }

      // Absences on regular workdays (Official Holidays & Sundays are NEVER deducted)
      const absentDays = Math.max(0, workingDays - presentDays - paidLeaveDays);
      const absenceDeduction = Math.round(absentDays * dailyRate);

      // Overtime & Shortfall Math
      const overtimePay = Math.round(totalOvertimeMinutes * minuteRate);
      const shortfallDeduction = Math.round(totalShortfallMinutes * minuteRate);
      const sundayPay = Math.round(totalSundayMinutes * minuteRate);

      // Active Finance Advance Loan Recovery
      const activeAdvance = await Finance.findOne({
        employee: emp._id,
        type: 'Advance',
        status: 'Approved',
      });

      let advanceDeduction = 0;
      if (activeAdvance) {
        advanceDeduction = activeAdvance.monthlyDeduction || 0;
      }

      // Bonuses
      const startDateMonth = new Date(targetYear, targetMonth - 1, 1);
      const endDateMonth = new Date(targetYear, targetMonth, 0);

      const activeBonus = await Finance.find({
        employee: emp._id,
        type: 'Bonus',
        status: 'Approved',
        createdAt: { $gte: startDateMonth, $lte: endDateMonth },
      });

      const bonus = activeBonus.reduce((sum, b) => sum + b.amount, 0);

      // Net Salary Formula
      const netSalary = Math.max(
        0,
        Math.round(baseSalary - absenceDeduction + overtimePay - shortfallDeduction + sundayPay + bonus - advanceDeduction)
      );

      const salary = await Salary.findOneAndUpdate(
        { employee: emp._id, month: targetMonth, year: targetYear },
        {
          employee: emp._id,
          month: targetMonth,
          year: targetYear,
          baseSalary,
          dailyRate,
          hourlyRate,
          minuteRate,
          totalDaysInMonth: daysInMonth,
          workingDays,
          sundaysCount,
          holidaysCount,
          paidLeaveDays,
          presentDays,
          absentDays,
          sundayWorkingDays,
          overtimeMinutes: totalOvertimeMinutes,
          overtimePay,
          shortfallMinutes: totalShortfallMinutes,
          shortfallDeduction,
          absenceDeduction,
          sundayPay,
          advanceDeduction,
          bonus,
          netSalary,
          paymentStatus: 'Generated',
        },
        { upsert: true, new: true }
      );

      generatedSalaries.push(salary);
    }

    await logAudit({
      user: req.user._id,
      action: 'GENERATE_SALARY',
      module: 'Salary',
      details: `Generated payroll for ${generatedSalaries.length} employee(s) for ${targetMonth}/${targetYear}`,
      req,
    });

    res.status(200).json({
      success: true,
      message: `Payroll calculated & generated for ${generatedSalaries.length} employee(s)`,
      salaries: generatedSalaries,
    });
  } catch (error) {
    next(error);
  }
};

export const getSalaries = async (req, res, next) => {
  try {
    const { month, year, employeeId } = req.query;
    let query = {};

    if (req.user.role === 'Employee') {
      query.employee = req.user._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const salaries = await Salary.find(query)
      .populate('employee', 'name employeeId email department designation baseSalary')
      .sort({ year: -1, month: -1 });

    res.status(200).json({ success: true, count: salaries.length, salaries });
  } catch (error) {
    next(error);
  }
};

export const downloadSalaryPDF = async (req, res, next) => {
  try {
    const salary = await Salary.findById(req.params.id).populate('employee');
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }

    const doc = new PDFDocument({ margin: 35, size: 'A4' });

    const empIdStr = salary.employee?.employeeId || 'EMP';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Salary_Slip_${empIdStr}_${salary.month}_${salary.year}.pdf`);

    doc.pipe(res);

    const emp = salary.employee || {};
    const formatCurrency = (val) => {
      const num = Number(val || 0);
      return `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[(salary.month || 1) - 1] || `Month ${salary.month}`;

    // --- Header Section ---
    // Top Color Accent Bar
    doc.rect(35, 35, 525, 6).fill('#4F46E5');

    // Header Title
    doc.fillColor('#0F172A').fontSize(18).font('Helvetica-Bold').text('ATTENDANCE & PAYROLL SYSTEM', 35, 50);
    doc.fillColor('#64748B').fontSize(9).font('Helvetica').text('Official Executive Pay Slip Statement', 35, 72);

    // Right-aligned Document Metadata
    doc.fillColor('#4F46E5').fontSize(11).font('Helvetica-Bold').text('CONFIDENTIAL PAYSLIP', 380, 50, { align: 'right' });
    doc.fillColor('#475569').fontSize(9).font('Helvetica').text(`Pay Period: ${monthName} ${salary.year}`, 380, 66, { align: 'right' });
    doc.fillColor('#166534').fontSize(8.5).font('Helvetica-Bold').text(`Status: ${salary.paymentStatus || 'Generated'}`, 380, 79, { align: 'right' });

    // Header Divider Line
    doc.moveTo(35, 94).lineTo(560, 94).strokeColor('#E2E8F0').lineWidth(1).stroke();

    // --- Employee & Calculation Info Cards ---
    let y = 104;

    // Card 1: Employee Details (Left Column Box)
    doc.roundedRect(35, y, 255, 105, 5).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.fillColor('#1E293B').fontSize(9.5).font('Helvetica-Bold').text('EMPLOYEE INFORMATION', 45, y + 8);

    doc.fontSize(8.5).font('Helvetica');
    const empDetails = [
      ['Name:', emp.name || 'N/A'],
      ['Employee ID:', emp.employeeId || 'N/A'],
      ['Department:', emp.department || 'General'],
      ['Designation:', emp.designation || 'Staff'],
      ['Email:', emp.email || 'N/A'],
    ];
    let card1Y = y + 23;
    empDetails.forEach(([label, val]) => {
      doc.fillColor('#64748B').font('Helvetica-Bold').text(label, 45, card1Y);
      doc.fillColor('#0F172A').font('Helvetica').text(val, 125, card1Y, { width: 155, ellipsis: true });
      card1Y += 14;
    });

    // Card 2: Pay Rate Breakdown (Right Column Box)
    doc.roundedRect(305, y, 255, 105, 5).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.fillColor('#1E293B').fontSize(9.5).font('Helvetica-Bold').text('RATE & CALCULATION BASIS', 315, y + 8);

    const rateDetails = [
      ['Base Monthly Salary:', formatCurrency(salary.baseSalary)],
      ['Daily Rate (Base/30):', formatCurrency(salary.dailyRate)],
      ['Hourly Rate (Daily/9):', formatCurrency(salary.hourlyRate)],
      ['Minute Rate:', formatCurrency(salary.minuteRate)],
      ['Standard Shift:', '9 Hours / Day'],
    ];
    let card2Y = y + 23;
    rateDetails.forEach(([label, val]) => {
      doc.fillColor('#64748B').font('Helvetica-Bold').text(label, 315, card2Y);
      doc.fillColor('#0F172A').font('Helvetica').text(val, 425, card2Y, { width: 125, align: 'right' });
      card2Y += 14;
    });

    y += 114;

    // --- Attendance Summary Ribbon ---
    doc.roundedRect(35, y, 525, 32, 4).fill('#EEF2FF');
    doc.fillColor('#3730A3').fontSize(8.5).font('Helvetica-Bold');
    doc.text('ATTENDANCE LOG SUMMARY:', 45, y + 11);

    doc.fillColor('#1E1B4B').fontSize(7.5).font('Helvetica');
    const attSummary = `Workdays: ${salary.workingDays || 0}d | Present: ${salary.presentDays || 0}d | Holidays: ${salary.holidaysCount || 0}d (Paid) | Leaves: ${salary.paidLeaveDays || 0}d | Sundays: ${salary.sundaysCount || 0}d | Absent: ${salary.absentDays || 0}d | OT: ${salary.overtimeMinutes || 0}m`;
    doc.text(attSummary, 175, y + 11, { width: 375, ellipsis: true });

    y += 40;

    // --- Earnings & Deductions Table Header ---
    doc.roundedRect(35, y, 525, 22, 4).fill('#0F172A');
    doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
    doc.text('EARNINGS & ADDITIONS', 45, y + 6);
    doc.text('AMOUNT', 215, y + 6, { width: 70, align: 'right' });
    doc.text('DEDUCTIONS & RECOVERIES', 305, y + 6);
    doc.text('AMOUNT', 475, y + 6, { width: 70, align: 'right' });

    y += 22;

    // Itemized Rows Data
    const earnings = [
      { name: 'Base Monthly Salary', amount: salary.baseSalary },
      { name: `Overtime Pay (${salary.overtimeMinutes || 0} mins)`, amount: salary.overtimePay },
      { name: `Sunday Bonus Pay (${salary.sundayWorkingDays || 0} days)`, amount: salary.sundayPay },
      { name: 'Performance Bonus', amount: salary.bonus },
    ];

    const deductions = [
      { name: `Absence Deduction (${salary.absentDays || 0} days)`, amount: salary.absenceDeduction },
      { name: `Shortfall Deduction (${salary.shortfallMinutes || 0} mins)`, amount: salary.shortfallDeduction },
      { name: 'Advance Loan Recovery', amount: salary.advanceDeduction },
      { name: 'Other Deductions / Statutory', amount: 0 },
    ];

    const maxRows = Math.max(earnings.length, deductions.length);
    let totalEarnings = 0;
    let totalDeductions = 0;

    doc.font('Helvetica').fontSize(8.5);

    for (let i = 0; i < maxRows; i++) {
      const e = earnings[i] || { name: '-', amount: 0 };
      const d = deductions[i] || { name: '-', amount: 0 };

      totalEarnings += e.amount || 0;
      totalDeductions += d.amount || 0;

      // Row background zebra striping
      if (i % 2 === 0) {
        doc.rect(35, y, 525, 20).fill('#F8FAFC');
      } else {
        doc.rect(35, y, 525, 20).fill('#FFFFFF');
      }

      // Divider Line
      doc.moveTo(35, y + 20).lineTo(560, y + 20).strokeColor('#F1F5F9').lineWidth(0.5).stroke();

      // Earnings Text & Amount
      doc.fillColor('#334155').text(e.name, 45, y + 5);
      doc.fillColor(e.amount > 0 ? '#166534' : '#64748B').text(e.amount > 0 ? formatCurrency(e.amount) : 'Rs. 0.00', 175, y + 5, { width: 110, align: 'right' });

      // Deductions Text & Amount
      doc.fillColor('#334155').text(d.name, 305, y + 5);
      doc.fillColor(d.amount > 0 ? '#991B1B' : '#64748B').text(d.amount > 0 ? `- ${formatCurrency(d.amount)}` : 'Rs. 0.00', 435, y + 5, { width: 110, align: 'right' });

      y += 20;
    }

    // --- Subtotals Row ---
    doc.rect(35, y, 525, 22).fill('#E2E8F0');
    doc.fillColor('#0F172A').fontSize(8.5).font('Helvetica-Bold');
    doc.text('TOTAL EARNINGS', 45, y + 6);
    doc.text(formatCurrency(totalEarnings), 175, y + 6, { width: 110, align: 'right' });

    doc.text('TOTAL DEDUCTIONS', 305, y + 6);
    doc.text(`- ${formatCurrency(totalDeductions)}`, 435, y + 6, { width: 110, align: 'right' });

    y += 30;

    // --- Net Take Home Banner ---
    doc.roundedRect(35, y, 525, 42, 6).fill('#1E293B');
    doc.fillColor('#94A3B8').fontSize(8.5).font('Helvetica-Bold').text('NET TAKE-HOME PAYABLE SALARY', 50, y + 9);
    doc.fillColor('#CBD5E1').fontSize(7.5).font('Helvetica').text('Formula: Base - Absences + OT - Shortfalls + Sundays + Bonus - Loan Advances', 50, y + 23);

    const netSalaryText = formatCurrency(salary.netSalary);
    doc.fillColor('#38BDF8').fontSize(15).font('Helvetica-Bold').text(netSalaryText, 340, y + 12, { width: 205, align: 'right' });

    y += 55;

    // --- Signatures & Verification Section ---
    doc.fontSize(8).font('Helvetica').fillColor('#64748B');

    // Left Box: Employer Signature
    doc.moveTo(45, y + 30).lineTo(185, y + 30).strokeColor('#CBD5E1').stroke();
    doc.text('Authorized Employer Signatory', 45, y + 35);
    doc.text('HR & Payroll Department', 45, y + 45);

    // Right Box: Employee Signature
    doc.moveTo(415, y + 30).lineTo(555, y + 30).strokeColor('#CBD5E1').stroke();
    doc.text('Employee Signature', 415, y + 35);
    doc.text('Date: ________________', 415, y + 45);

    // Footer Disclaimer
    doc.fontSize(7.5).fillColor('#94A3B8').text(
      'This document is computer generated using 9-hour dynamic shift math and minute-level precision rates. Does not require physical signature.',
      35,
      760,
      { align: 'center', width: 525 }
    );

    doc.end();
  } catch (error) {
    next(error);
  }
};
