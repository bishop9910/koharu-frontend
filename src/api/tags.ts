import http from "@/utils/request";
import type {
  getTagListResponse,
  createTagRequest,
  createTagResponse,
  deleteTagResponse
} from "@/api/types";

export function getTagList() {
  return http.get<getTagListResponse>('/tags')
}

export function createTag(createTagRequest: createTagRequest) {
  return http.post<createTagResponse>('/tags', createTagRequest)
}

export function deleteTag(id: string) {
  return http.delete<deleteTagResponse>(`/tags/${id}`)
}