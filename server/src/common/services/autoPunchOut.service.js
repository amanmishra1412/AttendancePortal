import { Attendance } from '../../modules/attendance/attendance.model.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * Automatically punches out any employee attendance where punchIn exists
 * but punchOut is missing, at 23:59 (1 minute before midnight / end of day).
 */
export const autoPunchOutUnclosedAttendances = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    // Find all attendance records where punchIn exists but punchOut is null or missing
    const unclosedRecords = await Attendance.find({
      'punchIn.timestamp': { $ne: null },
      $or: [
        { punchOut: { $exists: false } },
        { 'punchOut.timestamp': null },
        { punchOut: null },
      ],
    }).populate('employee', 'name email employeeId');

    if (!unclosedRecords || unclosedRecords.length === 0) {
      return 0;
    }

    let closedCount = 0;

    for (const record of unclosedRecords) {
      const isPastDate = record.date < todayStr;
      const isTodayEndOfDay = record.date === todayStr && (currentHours === 23 && currentMinutes >= 59);

      if (isPastDate || isTodayEndOfDay) {
        const [rYear, rMonth, rDay] = record.date.split('-').map(Number);

        // Exact 23:59:00 on the attendance record's calendar date
        const endOfDay = new Date(rYear, rMonth - 1, rDay, 23, 59, 0, 0);
        const punchInTime = new Date(record.punchIn.timestamp);

        let validEndTime = endOfDay;
        if (validEndTime <= punchInTime) {
          validEndTime = new Date(punchInTime.getTime() + 9 * 60 * 60 * 1000);
        }

        const totalWorkingMinutes = Math.max(0, Math.floor((validEndTime - punchInTime) / 60000));
        const STANDARD_SHIFT_MINUTES = 540; // 9 hours

        let overtimeMinutes = 0;
        let shortfallMinutes = 0;

        if (record.isSunday) {
          // Sunday work: all minutes count toward overtime bonus
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

        record.punchOut = {
          timestamp: validEndTime,
          latitude: record.punchIn.latitude || null,
          longitude: record.punchIn.longitude || null,
          distanceMeters: record.punchIn.distanceMeters || 0,
          isVerifiedGPS: true,
          status: shortfallMinutes > 0 ? 'Early Exit' : 'On Time',
        };

        record.totalWorkingMinutes = totalWorkingMinutes;
        record.overtimeMinutes = overtimeMinutes;
        record.shortfallMinutes = shortfallMinutes;
        record.remarks = record.remarks
          ? `${record.remarks} | Auto Punched Out at 23:59 (Day End)`
          : 'Auto Punched Out at 23:59 (Day End)';

        await record.save();
        closedCount++;

        console.log(
          `[AUTO PUNCH-OUT] Closed attendance for ${record.employee?.name || record.employee} on ${record.date} at 23:59:00 (${totalWorkingMinutes} mins worked)`
        );

        if (record.employee?._id) {
          await logAudit({
            user: record.employee._id,
            action: 'AUTO_PUNCH_OUT',
            module: 'Attendance',
            details: `Auto punched out at 23:59 for date ${record.date} (${totalWorkingMinutes} mins worked, OT: ${overtimeMinutes}m, Shortfall: ${shortfallMinutes}m)`,
          });
        }
      }
    }

    return closedCount;
  } catch (error) {
    console.error('[AUTO PUNCH-OUT ERROR]:', error);
    return 0;
  }
};

/**
 * Initializes background timer for automatic day-end punch out.
 * Runs every 30 seconds to catch 23:59 and past unclosed attendances.
 */
export const initAutoPunchOutScheduler = () => {
  // Run immediately on server boot to process any unclosed attendances from previous days
  autoPunchOutUnclosedAttendances().then((count) => {
    if (count > 0) {
      console.log(`[AUTO PUNCH-OUT INIT] Processed ${count} unclosed attendance records.`);
    }
  });

  // Schedule recurring check every 30 seconds
  setInterval(() => {
    autoPunchOutUnclosedAttendances();
  }, 30 * 1000);

  console.log('⏰ Auto Punch-Out Scheduler initialized (checks at 23:59 / 11:59 PM every day)');
};
