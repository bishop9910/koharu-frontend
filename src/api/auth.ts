import type { Role } from "@/enums/role";
import http from "@/utils/request";

type LoginRequest = {
  username: string,
  password: string
}

type UserLoginInfo = {
  id: string,
  username: string,
  role: Role
}

export function login(loginRequest: LoginRequest) {
  return http.post<{
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    user: UserLoginInfo
  }>(
    "/auth/login",
    loginRequest,
  )
}