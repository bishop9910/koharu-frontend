import http from "@/utils/request";
import type { LoginRequest, LoginResponse, PublicKeyResponse, verifyPasswordRequest, verifyPasswordResponse } from "./types";

export function login(loginRequest: LoginRequest) {
  return http.post<LoginResponse>(
    "/auth/login",
    loginRequest,
  )
}

export function getPublicKey() {
  return http.get<PublicKeyResponse>(
    "/auth/public-key"
  )
}

export function verifyPassword(verifyPasswordRequest: verifyPasswordRequest) {
  return http.post<verifyPasswordResponse>(
    "/auth/verify-password",
    verifyPasswordRequest,
    {
      skipAuthRefresh: true
    }
  )
}
