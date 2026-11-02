import http from '@/utils/request'
import type {
  MessageResponse,
  ReviewExemptionItem,
  ReviewExemptionListResponse
} from './types'

export function getReviewExemptions() {
  return http.get<ReviewExemptionListResponse>('/review-exemptions')
}

export function grantReviewExemption(userId: string) {
  return http.post<ReviewExemptionItem>(`/review-exemptions/${userId}`)
}

export function revokeReviewExemption(userId: string) {
  return http.delete<MessageResponse>(`/review-exemptions/${userId}`)
}
