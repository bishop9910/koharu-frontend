import http from '@/utils/request'
import type {
  AlbumDetail,
  AlbumImagesRequest,
  AlbumReaction,
  AlbumSummary,
  CreateAlbumReportRequest,
  CreateAlbumReportResponse,
  CreateAlbumRequest,
  MessageResponse,
  Paginated,
  PaginationQuery,
  ReviewAlbumRequest,
  ReviewAlbumResponse,
  SearchAlbumsQuery,
  UpdateAlbumRequest
} from './types'

export function createAlbum(payload: CreateAlbumRequest) {
  return http.post<AlbumDetail>('/albums', payload)
}

export function getAlbums(query: PaginationQuery = {}) {
  return http.get<Paginated<AlbumSummary>>('/albums', { params: query })
}

export function searchAlbums(query: SearchAlbumsQuery = {}) {
  return http.get<Paginated<AlbumSummary>>('/albums/search', { params: query })
}

export function getAlbum(id: string) {
  return http.get<AlbumDetail>(`/albums/${id}`)
}

export function updateAlbum(id: string, payload: UpdateAlbumRequest) {
  return http.patch<AlbumDetail>(`/albums/${id}`, payload)
}

export function deleteAlbum(id: string) {
  return http.delete<MessageResponse>(`/albums/${id}`)
}

export function unlockAlbum(id: string) {
  return http.post<AlbumDetail>(`/albums/${id}/unlock`)
}

export function addAlbumImages(id: string, payload: AlbumImagesRequest) {
  return http.post<AlbumDetail>(`/albums/${id}/images`, payload)
}

export function removeAlbumImages(id: string, payload: AlbumImagesRequest) {
  return http.delete<AlbumDetail>(`/albums/${id}/images`, { data: payload })
}

export function getFavoriteAlbums(query: PaginationQuery = {}) {
  return http.get<Paginated<AlbumSummary>>('/albums/favorites', { params: query })
}

export function getLikedAlbums(query: PaginationQuery = {}) {
  return http.get<Paginated<AlbumSummary>>('/albums/liked', { params: query })
}

export function likeAlbum(id: string) {
  return http.post<AlbumReaction>(`/albums/${id}/like`)
}

export function unlikeAlbum(id: string) {
  return http.delete<AlbumReaction>(`/albums/${id}/like`)
}

export function favoriteAlbum(id: string) {
  return http.post<AlbumReaction>(`/albums/${id}/favorite`)
}

export function unfavoriteAlbum(id: string) {
  return http.delete<AlbumReaction>(`/albums/${id}/favorite`)
}

export function reportAlbum(id: string, payload: CreateAlbumReportRequest) {
  return http.post<CreateAlbumReportResponse>(`/albums/${id}/reports`, payload)
}

export function submitAlbumReview(id: string) {
  return http.post<AlbumDetail>(`/albums/${id}/submit-review`)
}

export function reviewAlbum(id: string, payload: ReviewAlbumRequest) {
  return http.post<ReviewAlbumResponse>(`/albums/${id}/review`, payload)
}
