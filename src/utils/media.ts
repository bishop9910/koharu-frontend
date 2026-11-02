import { piniaTokenProvider } from '@/utils/token-provider'
import { API_BASE_URL } from '@/utils/env'

export function imageThumbnailUrl(imageId: string): string {
  return `${API_BASE_URL}/images/${imageId}/thumbnail`
}

export function avatarImageUrl(userId: string, pending = false): string {
  const suffix = pending ? '/pending/image' : '/image'
  return `${API_BASE_URL}/avatars/${userId}${suffix}`
}

/**
 * 图片流接口支持 access_token 查询参数，用于 <img> 这类无法带请求头的场景。
 */
export function withAccessToken(url: string): string {
  const accessToken = piniaTokenProvider.getAccess()
  if (!accessToken || url.includes('access_token=')) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}access_token=${encodeURIComponent(accessToken)}`
}
