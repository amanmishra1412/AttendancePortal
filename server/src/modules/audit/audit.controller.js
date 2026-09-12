import { AuditLog } from './audit.model.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const logs = await AuditLog.find({
      createdAt: { $gte: tenDaysAgo },
    })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(250);

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};
