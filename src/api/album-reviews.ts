import http from '@/utils/request'
import type { AlbumReviewItem, Paginated, PaginationQuery } from './types'

export function getPendingAlbumReviews(query: PaginationQuery = {}) {
  return http.get<Paginated<AlbumReviewItem>>('/album-reviews/pending', { params: query })
}