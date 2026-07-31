import { AuditLog } from './audit.model.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};
