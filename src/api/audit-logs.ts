import http from '@/utils/request'
import type { AuditLog, AuditLogQuery, Paginated } from './types'

export function getAuditLogs(query: AuditLogQuery = {}) {
  return http.get<Paginated<AuditLog>>('/audit-logs', { params: query })
}
