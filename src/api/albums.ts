import http from '@/utils/request'
import type {
  AlbumDetail,
  AlbumImagesRequest,
  AlbumSummary,
  CreateAlbumRequest,
  MessageResponse,
  Paginated,
  PaginationQuery,
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
