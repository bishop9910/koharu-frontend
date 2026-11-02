import http from '@/utils/request'
import type {
  Album,
  AlbumImagesRequest,
  CreateAlbumRequest,
  MessageResponse,
  Paginated,
  PaginationQuery,
  SearchAlbumsQuery,
  UpdateAlbumRequest
} from './types'

export function createAlbum(payload: CreateAlbumRequest) {
  return http.post<Album>('/albums', payload)
}

export function getAlbums(query: PaginationQuery) {
  return http.get<Paginated<Album>>('/albums', { params: query })
}

export function searchAlbums(query: SearchAlbumsQuery) {
  return http.get<Paginated<Album>>('/albums/search', { params: query })
}

export function getAlbum(id: string) {
  return http.get<Album>(`/albums/${id}`)
}

export function updateAlbum(id: string, payload: UpdateAlbumRequest) {
  return http.patch<Album>(`/albums/${id}`, payload)
}

export function deleteAlbum(id: string) {
  return http.delete<MessageResponse>(`/albums/${id}`)
}

export function unlockAlbum(id: string) {
  return http.post<Album>(`/albums/${id}/unlock`)
}

export function addAlbumImages(id: string, payload: AlbumImagesRequest) {
  return http.post<Album>(`/albums/${id}/images`, payload)
}

export function removeAlbumImages(id: string, payload: AlbumImagesRequest) {
  return http.delete<Album>(`/albums/${id}/images`, { data: payload })
}
