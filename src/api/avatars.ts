import http from "@/utils/request";
import type {
  uploadAvatarsRequest,
  uploadAvatarsResponse,
  deleteAvatarsResponse,
  apporoveAvatarsRequest,
  getAvatarStreamResponse
} from "@/api/types";

export function uploadAvatars(id: string, uploadAvatarsRequest: uploadAvatarsRequest) {
  return http.post<uploadAvatarsResponse>(`/avatars/${id}`, uploadAvatarsRequest)
}

export function deleteAvatars(id: string) {
  return http.delete<deleteAvatarsResponse>(`/avatars/${id}`)
}

export function apporoveAvatars(id: string, apporoveAvatarsRequest: apporoveAvatarsRequest) {
  return http.post(`/avatars/${id}`, apporoveAvatarsRequest)
}

export function getAvatarStream(id: string) {
  return http.get<getAvatarStreamResponse>(`/avatars/${id}/image`)
}