import bff from './bff';

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  tenantId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export const auditApi = {
  list(page = 1, pageSize = 50) {
    return bff.get<{ data: AuditLogEntry[]; total: number }>('/governance/audit-logs', {
      params: { page, pageSize },
    });
  },
};
