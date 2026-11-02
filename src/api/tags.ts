import http from '@/utils/request'
import type { MessageResponse, Tag } from './types'

export function getTags() {
  return http.get<Tag[]>('/tags')
}

export function createTag(name: string) {
  return http.post<Tag>('/tags', { name })
}

export function deleteTag(id: string) {
  return http.delete<MessageResponse>(`/tags/${id}`)
}
