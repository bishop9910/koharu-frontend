import http from "@/utils/request";
import type {
  uploadImageRequest,
  uploadImageReponse,
  getApprovedImageListaRequest,
  getApprovedImageListResponse,
  approveImageRequest,
  approveImageResponse,
  editImageRequest,
  editImageResponse,
  getUploadImageListResponse,
  getThumbnailStreamResponse,
  getDownLinkResponse,
  downImageResponse,
  getImageDetailResponse,
  deleteImageResponse,
  getUploadImageListRequest
} from './types';

export function uploadImage(uploadImageRequest: uploadImageRequest) {
  return http.post<uploadImageReponse>('/images', uploadImageRequest);
}

export function getApprovedImageList(getApprovedImageListaRequest: getApprovedImageListaRequest) {
  return http.get<getApprovedImageListResponse>('/images', {
    params: getApprovedImageListaRequest
  });
}

export function approveImage(id: string, approveImageRequest: approveImageRequest) {
  return http.post<approveImageResponse>(`/images/${id}/review`, approveImageRequest)
}

export function editImage(id: string, editImageRequest: editImageRequest) {
  return http.post<editImageResponse>(`/images/${id}/modify`, editImageRequest)
}

export function getUploadImageList(getUploadImageListRequest: getUploadImageListRequest) {
  return http.get<getUploadImageListResponse>('/images/my', {
    params: getUploadImageListRequest
  })
}

export function getThumbnailStream(id: string) {
  return http.get<getThumbnailStreamResponse>(`/images/${id}/thumbnail`)
}

export function getDownLink(id: string) {
  return http.get<getDownLinkResponse>(`/images/${id}/sign`)
}

export function downImage(id: string) {
  return http.get<downImageResponse>(`/images/${id}/download`)
}

export function getImageDetail(id: string) {
  return http.get<getImageDetailResponse>(`/images/${id}`)
}

export function deleteImage(id: string) {
  return http.delete<deleteImageResponse>(`/images/${id}`)
}