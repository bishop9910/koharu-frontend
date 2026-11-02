import http from '@/utils/request'
import type {
  LoginRequest,
  LoginResponse,
  PublicKeyResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  VerifyPasswordRequest,
  VerifyPasswordResponse
} from './types'

export function getPublicKey() {
  return http.get<PublicKeyResponse>('/auth/public-key')
}

export function login(payload: LoginRequest) {
  return http.post<LoginResponse>('/auth/login', payload, {
    skipAuthRefresh: true
  })
}

export function refreshAccessToken(payload: RefreshTokenRequest) {
  return http.post<RefreshTokenResponse>('/auth/refresh', payload, {
    skipAuthRefresh: true
  })
}

export function verifyPassword(payload: VerifyPasswordRequest) {
  return http.post<VerifyPasswordResponse>('/auth/verify-password', payload, {
    skipAuthRefresh: true
  })
}
