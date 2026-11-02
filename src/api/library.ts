import http from '@/utils/request'
import type {
  ChangeLibraryPasswordRequest,
  ChangeLibraryPasswordResponse,
  LibraryStatus,
  UnlockLibraryRequest
} from './types'

export function getLibraryStatus() {
  return http.get<LibraryStatus>('/library/status')
}

export function changeLibraryPassword(payload: ChangeLibraryPasswordRequest) {
  return http.post<ChangeLibraryPasswordResponse>('/library/password', payload)
}

export function unlockLibrary(payload: UnlockLibraryRequest) {
  return http.post<LibraryStatus>('/library/unlock', payload)
}
