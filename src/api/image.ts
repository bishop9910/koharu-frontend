import http from '@/utils/request'
import type {
  DownloadImageQuery,
  DownloadLinkResponse,
  ImageItem,
  ImageListQuery,
  MessageResponse,
  ModifyImageResponse,
  MyImageListQuery,
  MyImageListItem,
  Paginated,
  PendingImage,
  ReviewImageRequest,
  UploadImageResponse
} from './types'

export function uploadImage(formData: FormData) {
  return http.upload<UploadImageResponse>('/images', formData)
}

/** 公开图库，默认只返回已过审图片 */
export function getImages(query: ImageListQuery) {
  return http.get<Paginated<ImageItem>>('/images', { params: query })
}

export function getMyImages(query: MyImageListQuery) {
  return http.get<Paginated<MyImageListItem>>('/images/my', { params: query })
}

export function getPendingImages(query: ImageListQuery) {
  return http.get<Paginated<PendingImage>>('/images/pending', { params: query })
}

export function reviewImage(id: string, payload: ReviewImageRequest) {
  return http.post<ImageItem>(`/images/${id}/review`, payload)
}

export function modifyImage(id: string, formData: FormData) {
  return http.upload<ModifyImageResponse>(`/images/${id}/modify`, formData)
}

export function getImage(id: string) {
  return http.get<ImageItem>(`/images/${id}`)
}

export function getThumbnailStream(id: string) {
  return http.get<Blob>(`/images/${id}/thumbnail`, { responseType: 'blob' })
}

export function signImageDownload(id: string) {
  return http.get<DownloadLinkResponse>(`/images/${id}/sign`)
}

export function downloadImage(id: string, query: DownloadImageQuery) {
  return http.download(`/images/${id}/download`, { params: query })
}

export function deleteImage(id: string) {
  return http.delete<MessageResponse>(`/images/${id}`)
}
