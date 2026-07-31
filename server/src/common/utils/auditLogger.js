import { AuditLog } from '../../modules/audit/audit.model.js';

export const logAudit = async ({ user, action, module, details, req }) => {
  try {
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';
    await AuditLog.create({
      user: user?._id || user,
      action,
      module,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('Failed to log audit event:', err.message);
  }
};
