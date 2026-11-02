import http from '@/utils/request'
import type {
  MessageResponse,
  Paginated,
  PaginationQuery,
  PendingAvatar,
  ReviewAvatarRequest,
  ReviewAvatarResponse,
  UploadAvatarResponse
} from './types'

export function getPendingAvatars(query: PaginationQuery) {
  return http.get<Paginated<PendingAvatar>>('/avatars/pending', { params: query })
}

export function uploadAvatar(userId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return http.upload<UploadAvatarResponse>(`/avatars/${userId}`, formData)
}

export function reviewAvatar(userId: string, payload: ReviewAvatarRequest) {
  return http.post<ReviewAvatarResponse>(`/avatars/${userId}/review`, payload)
}

export function getPendingAvatarStream(userId: string) {
  return http.get<Blob>(`/avatars/${userId}/pending/image`, { responseType: 'blob' })
}

export function deleteAvatar(userId: string) {
  return http.delete<MessageResponse>(`/avatars/${userId}`)
}
