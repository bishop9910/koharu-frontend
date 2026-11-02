import { RequestError } from '@/utils/request'

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function getErrorMessage(error: unknown, fallback = '操作失败，请稍后重试'): string {
  if (error instanceof RequestError) {
    if (error.status === 429) return '操作过于频繁，请稍后再试'
    if (error.status === 401) return '登录已失效，请重新登录'
    return error.message || fallback
  }
  if (error instanceof Error) return error.message || fallback
  return fallback
}
