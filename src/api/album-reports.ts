import http from '@/utils/request'
import type {
  AlbumReportItem,
  AlbumReportQuery,
  HandleAlbumReportRequest,
  HandleAlbumReportResponse,
  Paginated
} from './types'

export function getAlbumReports(query: AlbumReportQuery = {}) {
  return http.get<Paginated<AlbumReportItem>>('/album-reports', { params: query })
}

export function getAlbumReport(id: string) {
  return http.get<AlbumReportItem>(`/album-reports/${id}`)
}

export function verifyAlbumReport(id: string, payload: HandleAlbumReportRequest = {}) {
  return http.post<HandleAlbumReportResponse>(`/album-reports/${id}/verify`, payload)
}

export function dismissAlbumReport(id: string, payload: HandleAlbumReportRequest = {}) {
  return http.post<HandleAlbumReportResponse>(`/album-reports/${id}/dismiss`, payload)
}