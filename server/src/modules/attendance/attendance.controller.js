import { Attendance } from './attendance.model.js';
import { AttendanceRequest } from './attendanceRequest.model.js';
import { OfficeSettings } from '../office/office.model.js';
import { calculateDistanceMeters } from '../../common/utils/geo.utils.js';
import { logAudit } from '../../common/utils/auditLogger.js';

export const punchIn = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user._id;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      return res.status(400).json({
        success: false,
        message: 'GPS Location Required! Please enable browser location permissions to Punch In.',
      });
    }

    let office = await OfficeSettings.findOne();
    if (!office) office = await OfficeSettings.create({});

    const distanceMeters = calculateDistanceMeters(
      latitude,
      longitude,
      office.latitude,
      office.longitude
    );

    // Strict Location Enforcement
    if (distanceMeters > office.allowedRadiusMeters) {
      return res.status(400).json({
        success: false,
        message: `Location Access Denied! You are ${distanceMeters}m away from office. You must be within ${office.allowedRadiusMeters}m boundary to Punch In.`,
        distanceMeters,
        allowedRadiusMeters: office.allowedRadiusMeters,
      });
    }

    let attendance = await Attendance.findOne({ employee: userId, date: todayStr });
    if (attendance && attendance.punchIn?.timestamp) {
      return res.status(400).json({ success: false, message: 'You have already punched in today' });
    }

    // Dynamic 9-Hour Shift End Calculation: Punch In + 9 Hours (540 minutes)
    const expectedPunchOutTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const isSunday = now.getDay() === 0;

    const punchInData = {
      timestamp: now,
      latitude,
      longitude,
      distanceMeters,
      isVerifiedGPS: true,
      status: 'On Time',
    };

    if (!attendance) {
      attendance = await Attendance.create({
        employee: userId,
        date: todayStr,
        punchIn: punchInData,
        expectedPunchOutTime,
        isSunday,
        status: 'Present',
      });
    } else {
      attendance.punchIn = punchInData;
      attendance.expectedPunchOutTime = expectedPunchOutTime;
      attendance.isSunday = isSunday;
      attendance.status = 'Present';
      await attendance.save();
    }

    await logAudit({
      user: userId,
      action: 'PUNCH_IN',
      module: 'Attendance',
      details: `Punched In at ${now.toLocaleTimeString()} (Shift Target: ${expectedPunchOutTime.toLocaleTimeString()} - 9 Hours)`,
      req,
    });

    res.status(200).json({
      success: true,
      message: `Punched in successfully! Your 9-hour shift end target is ${expectedPunchOutTime.toLocaleTimeString()}`,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const punchOut = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user._id;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      return res.status(400).json({
        success: false,
        message: 'GPS Location Required! Please enable browser location permissions to Punch Out.',
      });
    }

    let office = await OfficeSettings.findOne();
    if (!office) office = await OfficeSettings.create({});

    const distanceMeters = calculateDistanceMeters(
      latitude,
      longitude,
      office.latitude,
      office.longitude
    );

    if (distanceMeters > office.allowedRadiusMeters) {
      return res.status(400).json({
        success: false,
        message: `Location Access Denied! You are ${distanceMeters}m away from office. You must be within ${office.allowedRadiusMeters}m boundary to Punch Out.`,
        distanceMeters,
        allowedRadiusMeters: office.allowedRadiusMeters,
      });
    }

    const attendance = await Attendance.findOne({ employee: userId, date: todayStr });
    if (!attendance || !attendance.punchIn?.timestamp) {
      return res.status(400).json({ success: false, message: 'No active punch in found for today' });
    }

    if (attendance.punchOut?.timestamp) {
      return res.status(400).json({ success: false, message: 'You have already punched out today' });
    }

    const punchInTime = new Date(attendance.punchIn.timestamp);
    const totalWorkingMinutes = Math.max(0, Math.floor((now - punchInTime) / 60000));
    const STANDARD_SHIFT_MINUTES = 540; // 9 Hours

    let overtimeMinutes = 0;
    let shortfallMinutes = 0;

    if (attendance.isSunday) {
      // Sunday Work: ALL minutes are counted towards Sunday Overtime Bonus
      overtimeMinutes = totalWorkingMinutes;
      shortfallMinutes = 0;
    } else {
      // Regular Work Day: 9-Hour Baseline
      if (totalWorkingMinutes > STANDARD_SHIFT_MINUTES) {
        overtimeMinutes = totalWorkingMinutes - STANDARD_SHIFT_MINUTES;
        shortfallMinutes = 0;
      } else if (totalWorkingMinutes < STANDARD_SHIFT_MINUTES) {
        shortfallMinutes = STANDARD_SHIFT_MINUTES - totalWorkingMinutes;
        overtimeMinutes = 0;
      }
    }

    attendance.punchOut = {
      timestamp: now,
      latitude,
      longitude,
      distanceMeters,
      isVerifiedGPS: true,
      status: shortfallMinutes > 0 ? 'Early Exit' : 'On Time',
    };

    attendance.totalWorkingMinutes = totalWorkingMinutes;
    attendance.overtimeMinutes = overtimeMinutes;
    attendance.shortfallMinutes = shortfallMinutes;

    await attendance.save();

    await logAudit({
      user: userId,
      action: 'PUNCH_OUT',
      module: 'Attendance',
      details: `Punched out (${totalWorkingMinutes} mins worked. OT: ${overtimeMinutes}m, Shortfall: ${shortfallMinutes}m)`,
      req,
    });

    res.status(200).json({
      success: true,
      message: `Punched out successfully! (${Math.floor(totalWorkingMinutes / 60)}h ${totalWorkingMinutes % 60}m worked)`,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayStatus = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ employee: req.user._id, date: todayStr });
    res.status(200).json({ success: true, attendance: attendance || null });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceHistory = async (req, res, next) => {
  try {
    const { employeeId, month, year, date } = req.query;
    let targetEmployeeId = null;

    if (req.user.role === 'Employee') {
      targetEmployeeId = req.user._id;
    } else if (employeeId) {
      targetEmployeeId = employeeId;
    }

    let query = {};
    if (targetEmployeeId) {
      query.employee = targetEmployeeId;
    }

    if (date) {
      query.date = date;
    } else if (month && year) {
      const monthFormatted = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${monthFormatted}` };
    }

    const historyLogs = await Attendance.find(query)
      .populate('employee', 'name employeeId email department designation')
      .sort({ date: -1 });

    // Fetch regularization requests for this query scope
    let reqQuery = {};
    if (targetEmployeeId) reqQuery.employee = targetEmployeeId;
    if (date) {
      reqQuery.date = date;
    } else if (month && year) {
      const monthFormatted = String(month).padStart(2, '0');
      reqQuery.date = { $regex: `^${year}-${monthFormatted}` };
    }
    const regularizationRequests = await AttendanceRequest.find(reqQuery);
    const reqMap = {};
    regularizationRequests.forEach((r) => {
      reqMap[r.date] = r;
    });

    // If fetching for a specific employee and specific month & year, build full month calendar dates
    if (targetEmployeeId && month && year && !date) {
      const yearNum = parseInt(year, 10);
      const monthNum = parseInt(month, 10);
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
      const todayStr = new Date().toISOString().split('T')[0];

      const historyMap = {};
      historyLogs.forEach((log) => {
        historyMap[log.date] = log;
      });

      const fullHistory = [];
      // Generate dates from end of month down to 1st (descending)
      for (let d = daysInMonth; d >= 1; d--) {
        const dStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayOfWeek = new Date(dStr).getDay();
        const isSunday = dayOfWeek === 0;

        if (historyMap[dStr]) {
          const logObj = historyMap[dStr].toObject();
          logObj.regularizationRequest = reqMap[dStr] || null;
          fullHistory.push(logObj);
        } else {
          // No record exists in DB
          let status = 'Absent';
          if (isSunday) {
            status = 'Sunday';
          } else if (dStr > todayStr) {
            status = '-';
          }

          fullHistory.push({
            _id: `absent-${dStr}`,
            date: dStr,
            employee: historyLogs[0]?.employee || targetEmployeeId,
            punchIn: null,
            punchOut: null,
            totalWorkingMinutes: 0,
            overtimeMinutes: 0,
            shortfallMinutes: 0,
            isSunday,
            status,
            isPlaceholder: true,
            regularizationRequest: reqMap[dStr] || null,
          });
        }
      }

      return res.status(200).json({ success: true, count: fullHistory.length, history: fullHistory });
    }

    // Otherwise, attach regularization requests to history logs
    const historyWithReqs = historyLogs.map((log) => {
      const logObj = log.toObject();
      logObj.regularizationRequest = reqMap[log.date] || null;
      return logObj;
    });

    res.status(200).json({ success: true, count: historyWithReqs.length, history: historyWithReqs });
  } catch (error) {
    next(error);
  }
};

export const submitRegularizationRequest = async (req, res, next) => {
  try {
    const { date, requestedPunchIn, requestedPunchOut, reason } = req.body;
    const userId = req.user._id;

    if (!date || !requestedPunchIn || !requestedPunchOut || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Date, Requested Punch In, Requested Punch Out, and Reason.',
      });
    }

    const punchInDate = new Date(requestedPunchIn);
    const punchOutDate = new Date(requestedPunchOut);

    if (isNaN(punchInDate.getTime()) || isNaN(punchOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid punch in or punch out date/time format.',
      });
    }

    if (punchOutDate <= punchInDate) {
      return res.status(400).json({
        success: false,
        message: 'Punch Out time must be after Punch In time.',
      });
    }

    // Check existing pending request
    const existingPending = await AttendanceRequest.findOne({
      employee: userId,
      date,
      status: 'Pending',
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: `A regularization request for ${date} is already pending review by Admin.`,
      });
    }

    const request = await AttendanceRequest.create({
      employee: userId,
      date,
      requestedPunchIn: punchInDate,
      requestedPunchOut: punchOutDate,
      reason,
      status: 'Pending',
    });

    await logAudit({
      user: userId,
      action: 'ATTENDANCE_REGULARIZATION_SUBMITTED',
      module: 'Attendance',
      details: `Submitted regularization request for date ${date}`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Attendance regularization request submitted successfully!',
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const getRegularizationRequests = async (req, res, next) => {
  try {
    const { status, employeeId } = req.query;
    let query = {};

    if (req.user.role === 'Employee') {
      query.employee = req.user._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (status) {
      query.status = status;
    }

    const requests = await AttendanceRequest.find(query)
      .populate('employee', 'name employeeId email department designation')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

export const reviewRegularizationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be Approved or Rejected.',
      });
    }

    const request = await AttendanceRequest.findById(id).populate('employee');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Regularization request not found.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Request has already been ${request.status.toLowerCase()}.`,
      });
    }

    request.status = status;
    request.reviewedBy = req.user._id;
    request.adminRemarks = adminRemarks || '';
    await request.save();

    if (status === 'Approved') {
      const punchInDate = new Date(request.requestedPunchIn);
      const punchOutDate = new Date(request.requestedPunchOut);
      const totalWorkingMinutes = Math.max(0, Math.floor((punchOutDate - punchInDate) / 60000));
      const STANDARD_SHIFT_MINUTES = 540; // 9 Hours

      const dayOfWeek = new Date(request.date).getDay();
      const isSunday = dayOfWeek === 0;

      let overtimeMinutes = 0;
      let shortfallMinutes = 0;

      if (isSunday) {
        overtimeMinutes = totalWorkingMinutes;
        shortfallMinutes = 0;
      } else {
        if (totalWorkingMinutes > STANDARD_SHIFT_MINUTES) {
          overtimeMinutes = totalWorkingMinutes - STANDARD_SHIFT_MINUTES;
          shortfallMinutes = 0;
        } else if (totalWorkingMinutes < STANDARD_SHIFT_MINUTES) {
          shortfallMinutes = STANDARD_SHIFT_MINUTES - totalWorkingMinutes;
          overtimeMinutes = 0;
        }
      }

      const expectedPunchOutTime = new Date(punchInDate.getTime() + 9 * 60 * 60 * 1000);

      let attendance = await Attendance.findOne({
        employee: request.employee._id,
        date: request.date,
      });

      const punchInData = {
        timestamp: punchInDate,
        latitude: null,
        longitude: null,
        distanceMeters: 0,
        isVerifiedGPS: false,
        status: 'On Time',
      };

      const punchOutData = {
        timestamp: punchOutDate,
        latitude: null,
        longitude: null,
        distanceMeters: 0,
        isVerifiedGPS: false,
        status: shortfallMinutes > 0 ? 'Early Exit' : 'On Time',
      };

      if (!attendance) {
        attendance = await Attendance.create({
          employee: request.employee._id,
          date: request.date,
          punchIn: punchInData,
          punchOut: punchOutData,
          expectedPunchOutTime,
          totalWorkingMinutes,
          overtimeMinutes,
          shortfallMinutes,
          isSunday,
          status: 'Present',
          remarks: `Regularized: ${request.reason}`,
        });
      } else {
        attendance.punchIn = punchInData;
        attendance.punchOut = punchOutData;
        attendance.expectedPunchOutTime = expectedPunchOutTime;
        attendance.totalWorkingMinutes = totalWorkingMinutes;
        attendance.overtimeMinutes = overtimeMinutes;
        attendance.shortfallMinutes = shortfallMinutes;
        attendance.isSunday = isSunday;
        attendance.status = 'Present';
        attendance.remarks = `Regularized: ${request.reason}`;
        await attendance.save();
      }
    }

    await logAudit({
      user: req.user._id,
      action: status === 'Approved' ? 'ATTENDANCE_REGULARIZATION_APPROVED' : 'ATTENDANCE_REGULARIZATION_REJECTED',
      module: 'Attendance',
      details: `${status} regularization request for ${request.date} (Employee: ${request.employee?.name})`,
      req,
    });

    res.status(200).json({
      success: true,
      message: `Regularization request ${status.toLowerCase()} successfully!`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

