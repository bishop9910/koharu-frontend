import http from "@/utils/request";
import type {
  createAlbumsRequest,
  createAlbumsResponse,
  getAlbumsListRequest,
  getAlbumsListResponse,
  searchAlbumsRequest,
  searchAlbumsResponse,
  getAlubumDetailResponse,
  editAlumRequest,
  editAlumResponse,
  deleteAlbumResponse,
  unlockAlbumResponse,
  archiveImagesRequest,
  archiveImagesResponse,
  removeImageRequest,
  removeImageResponse
} from "@/api/types";
import type { DrawerTheme } from "naive-ui/es/drawer/styles";

export function createAlbums(createAlbumsRequest: createAlbumsRequest) {
  return http.post<createAlbumsResponse>('/albums', createAlbumsRequest)
}

export function getAlbumsList(getAlbumsListRequest: getAlbumsListRequest) {
  return http.get<getAlbumsListResponse>('/albums', {
    params: getAlbumsListRequest
  })
}

export function searchAlbums(searchAlbumsRequest: searchAlbumsRequest) {
  return http.get<searchAlbumsResponse>('/albums/search', {
    params: searchAlbumsRequest
  })
}

export function getAlubumDetail(id: string) {
  return http.get<getAlubumDetailResponse>(`/albums/${id}`)
}

export function editAlum(id: string, editAlumRequest: editAlumRequest) {
  return http.patch<editAlumResponse>(`/albums/${id}`, editAlumRequest)
}

export function deleteAlbum(id: string) {
  return http.delete<deleteAlbumResponse>(`/albums/${id}`)
}

export function unlockAlbum(id: string) {
  return http.post<unlockAlbumResponse>(`/albums/${id}/unlock`)
}

export function archiveImages(id: string, archiveImagesRequest: archiveImagesRequest) {
  return http.post<archiveImagesResponse>(`/albums/${id}/images`, archiveImagesRequest)
}

export function removeImage(id: string, removeImageRequest: removeImageRequest) {
  return http.delete<removeImageResponse>(`/albums/${id}/images`, {
    data: removeImageRequest
  })
}