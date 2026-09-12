import { AuditLog } from '../../modules/audit/audit.model.js';

const RETENTION_DAYS = 10;

/**
 * Automatically deletes audit logs older than the retention period (10 days).
 */
export const cleanupOldAuditLogs = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    if (result.deletedCount > 0) {
      console.log(
        `[AUDIT CLEANUP] 🧹 Successfully purged ${result.deletedCount} audit logs older than ${RETENTION_DAYS} days.`
      );
    }
    return result.deletedCount;
  } catch (error) {
    console.error('[AUDIT CLEANUP ERROR]:', error.message);
    return 0;
  }
};

/**
 * Initializes background scheduler for recurring audit log cleanup.
 * Runs on server startup and every 6 hours thereafter.
 */
export const initAuditCleanupScheduler = () => {
  // Execute immediately upon server startup
  cleanupOldAuditLogs().then((count) => {
    if (count > 0) {
      console.log(`[AUDIT CLEANUP INIT] Purged ${count} old audit logs.`);
    }
  });

  // Schedule to run every 6 hours (6 * 60 * 60 * 1000 ms)
  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    cleanupOldAuditLogs();
  }, SIX_HOURS_MS);

  console.log(
    `🧹 Audit Log Auto-Cleanup Scheduler active (Retaining last ${RETENTION_DAYS} days, running every 6 hours)`
  );
};
