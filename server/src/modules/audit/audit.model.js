import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  { timestamps: true }
);

// Automatically delete audit logs older than 10 days (10 days * 24h * 60m * 60s = 864,000 seconds)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 10 * 24 * 60 * 60 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
