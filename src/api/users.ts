import http from '@/utils/request'
import type {
  ChangePasswordRequest,
  CreateUserRequest,
  MessageResponse,
  Paginated,
  PaginationQuery,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  User,
  UserListItem,
  UserPublicInfo
} from './types'

export function createUser(payload: CreateUserRequest) {
  return http.post<User>('/users', payload)
}

export function listUsers(query: PaginationQuery = {}) {
  return http.get<Paginated<UserListItem>>('/users', { params: query })
}

export function getCurrentUser() {
  return http.get<User>('/users/me')
}

export function changePassword(payload: ChangePasswordRequest, reauthToken: string) {
  return http.patch<MessageResponse>('/users/me/password', payload, {
    headers: {
      'X-Reauth-Token': reauthToken
    }
  })
}

export function getUserPublicInfo(userId: string) {
  return http.get<UserPublicInfo>(`/users/${userId}/public`)
}

export function getUser(userId: string) {
  return http.get<User>(`/users/${userId}`)
}

export function updateUser(userId: string, payload: UpdateUserRequest) {
  return http.patch<User>(`/users/${userId}`, payload)
}

export function deleteUser(userId: string, reauthToken: string) {
  return http.delete<MessageResponse>(`/users/${userId}`, {
    headers: {
      'X-Reauth-Token': reauthToken
    }
  })
}

export function updateUserRole(
  userId: string,
  payload: UpdateUserRoleRequest,
  reauthToken: string
) {
  return http.patch<User>(`/users/${userId}/role`, payload, {
    headers: {
      'X-Reauth-Token': reauthToken
    }
  })
}
