import { Attendance } from './attendance.model.js';
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
    let query = {};

    if (req.user.role === 'Employee') {
      query.employee = req.user._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (date) {
      query.date = date;
    } else if (month && year) {
      const monthFormatted = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${monthFormatted}` };
    }

    const history = await Attendance.find(query)
      .populate('employee', 'name employeeId email department designation')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: history.length, history });
  } catch (error) {
    next(error);
  }
};
