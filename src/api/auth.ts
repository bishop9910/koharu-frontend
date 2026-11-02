import http from '@/utils/request'
import type {
  LoginRequest,
  LoginResponse,
  PublicKeyResponse,
  VerifyPasswordRequest,
  VerifyPasswordResponse
} from './types'

export function login(payload: LoginRequest) {
  return http.post<LoginResponse>('/auth/login', payload, {
    skipAuthRefresh: true
  })
}

export function getPublicKey() {
  return http.get<PublicKeyResponse>('/auth/public-key')
}

export function verifyPassword(payload: VerifyPasswordRequest) {
  return http.post<VerifyPasswordResponse>('/auth/verify-password', payload, {
    skipAuthRefresh: true
  })
}
