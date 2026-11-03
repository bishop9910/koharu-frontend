import type { AlbumReportStatus, AlbumReviewStatus } from '@/api/types'

export const ALBUM_REVIEW_STATUS_LABEL: Record<AlbumReviewStatus, string> = {
  none: '未送审',
  pending: '待评审',
  approved: '已通过',
  rejected: '已驳回'
}

export const ALBUM_REPORT_STATUS_LABEL: Record<AlbumReportStatus, string> = {
  pending: '待处理',
  verified: '已核实',
  dismissed: '已驳回',
  resolved: '已处理'
}

export const ALBUM_REPORT_STATUS_OPTIONS: { label: string; value: AlbumReportStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '已核实', value: 'verified' },
  { label: '已驳回', value: 'dismissed' },
  { label: '已处理', value: 'resolved' }
]
