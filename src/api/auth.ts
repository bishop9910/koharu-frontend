import http from "@/utils/request";
import type { LoginRequest, LoginResponse, PublicKeyResponse } from "./types";

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