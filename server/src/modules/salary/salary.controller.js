import PDFDocument from 'pdfkit';
import { Salary } from './salary.model.js';
import { User } from '../auth/user.model.js';
import { Attendance } from '../attendance/attendance.model.js';
import { Finance } from '../finance/finance.model.js';
import { logAudit } from '../../common/utils/auditLogger.js';

export const generateSalary = async (req, res, next) => {
  try {
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

      // Calculate Sundays & Workdays in Month
      let sundaysCount = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(targetYear, targetMonth - 1, day);
        if (d.getDay() === 0) sundaysCount++;
      }

      // Absences on regular workdays
      const absentDays = Math.max(0, (daysInMonth - sundaysCount) - presentDays);
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

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Salary_Slip_${salary.employee.employeeId}_${salary.month}_${salary.year}.pdf`);

    doc.pipe(res);

    // Header Branding (Light Styling)
    doc.fillColor('#0F172A').fontSize(22).text('ATTENDANCE & PAYROLL SYSTEM', { align: 'center' });
    doc.fontSize(11).fillColor('#64748B').text('Official Monthly Executive Pay Slip', { align: 'center' });
    doc.moveDown(1.2);

    doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#CBD5E1').stroke();
    doc.moveDown(1);

    // Employee & Pay Period Details Grid
    const startY = doc.y;
    doc.fontSize(9.5).fillColor('#334155');

    const empName = salary.employee?.name || 'Employee';
    const empId = salary.employee?.employeeId || '-';
    const empDept = salary.employee?.department || 'General';
    const empDesig = salary.employee?.designation || 'Staff';

    doc.text(`Employee Name: ${empName}`, 50, startY);
    doc.text(`Employee ID: ${empId}`, 50, startY + 16);
    doc.text(`Department: ${empDept}`, 50, startY + 32);
    doc.text(`Designation: ${empDesig}`, 50, startY + 48);

    doc.text(`Pay Period: ${salary.month}/${salary.year}`, 320, startY);
    doc.text(`Base Monthly Salary: ₹${(salary.baseSalary || 0).toLocaleString()}`, 320, startY + 16);
    doc.text(`Daily Rate (Base/30): ₹${salary.dailyRate || 0}`, 320, startY + 32);
    doc.text(`Hourly Rate (Daily/9): ₹${salary.hourlyRate || 0}`, 320, startY + 48);

    doc.moveDown(5);

    // Table Header
    const tableTop = doc.y;
    doc.rect(40, tableTop, 515, 22).fill('#F1F5F9');
    doc.fillColor('#0F172A').fontSize(10).text('Earnings & Additions', 50, tableTop + 6);
    doc.text('Amount (₹)', 230, tableTop + 6);
    doc.text('Deductions & Shortfalls', 310, tableTop + 6);
    doc.text('Amount (₹)', 480, tableTop + 6);

    let rowY = tableTop + 28;
    doc.fontSize(9).fillColor('#334155');

    // Row 1: Base Salary & Absence
    doc.text('Base Salary', 50, rowY);
    doc.text(`₹${salary.baseSalary.toLocaleString()}`, 230, rowY);
    doc.text(`Absence Deduction (${salary.absentDays} days)`, 310, rowY);
    doc.text(`₹${salary.absenceDeduction.toLocaleString()}`, 480, rowY);

    // Row 2: Overtime & Shortfall
    rowY += 18;
    doc.text(`Overtime Pay (${salary.overtimeMinutes} mins)`, 50, rowY);
    doc.text(`₹${salary.overtimePay.toLocaleString()}`, 230, rowY);
    doc.text(`Shortfall Deduction (${salary.shortfallMinutes} mins)`, 310, rowY);
    doc.text(`₹${salary.shortfallDeduction.toLocaleString()}`, 480, rowY);

    // Row 3: Sunday Work & Advance Loan Recovery
    rowY += 18;
    doc.text(`Sunday Work Bonus Pay`, 50, rowY);
    doc.text(`₹${salary.sundayPay.toLocaleString()}`, 230, rowY);
    doc.text('Advance Loan Recovery', 310, rowY);
    doc.text(`₹${salary.advanceDeduction.toLocaleString()}`, 480, rowY);

    // Row 4: Performance Bonus
    rowY += 18;
    doc.text('Performance Bonus', 50, rowY);
    doc.text(`₹${salary.bonus.toLocaleString()}`, 230, rowY);
    doc.text('-', 310, rowY);
    doc.text('₹0', 480, rowY);

    doc.moveDown(3);

    // Net Salary Box
    const totalBoxY = doc.y + 20;
    doc.rect(40, totalBoxY, 515, 38).fill('#4F46E5');
    doc.fillColor('#FFFFFF').fontSize(13).text('NET TAKE-HOME SALARY:', 50, totalBoxY + 11);
    doc.fontSize(15).text(`₹${salary.netSalary.toLocaleString()}`, 380, totalBoxY + 9, { align: 'right' });

    doc.moveDown(4);
    doc.fontSize(8.5).fillColor('#64748B').text('System-calculated using 9-hour dynamic shift math & minute-level rates.', 40, 750, { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};
