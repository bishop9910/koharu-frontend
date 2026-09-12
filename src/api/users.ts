import http from "@/utils/request";
import type { 
  NewUserResponse,
  NewUserRequest, 
  ListUserRequest, 
  ListUserResponse, 
  GetSelfInfoResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  GetUserPublicInfoRequest,
  GetUserPublicInfoResponse,
  GetUserInfoRequest,
  GetUserInfoResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  UpdateUserRoleRequest,
  UpdateUserRoleResponse
 } from "./types";

export function newUser(newUserRquest: NewUserRequest){
  return http.post<NewUserResponse>(
    "/users",
    newUserRquest,
  )
}

export function listUser(listUserRequest: ListUserRequest){
  return http.get<ListUserResponse>(
    "/users",
    {
      params: listUserRequest
    }
  )
}

export function getSelfInfo(){
  return http.get<GetSelfInfoResponse>(
    "/users/me"
  )
}

export function changePassword(changePasswordRequest: ChangePasswordRequest){
  return http.patch<ChangePasswordResponse>(
    "/users/me/password",
    changePasswordRequest
  )
}

export function getUserPublicInfo(getUserPublicInfoRequest: GetUserPublicInfoRequest){
  return http.get<GetUserPublicInfoResponse>(
    `/users/${getUserPublicInfoRequest.id}/public`
  )
}

export function getUserInfo(getUserInfoRequest: GetUserInfoRequest){
  return http.get<GetUserInfoResponse>(
    `/users/${getUserInfoRequest.id}`
  )
}

export function updateUser(userId: string, updateUserRequest: UpdateUserRequest){
  return http.patch<UpdateUserResponse>(
    `/users/${userId}`,
    updateUserRequest
  )
}

export function deleteUser(deleteUserRequest: DeleteUserRequest){
  return http.delete<DeleteUserResponse>(
    `/users/${deleteUserRequest.id}`
  )
}

export function updateUserRole(userId: string, updateUserRoleRequest: UpdateUserRoleRequest){
  return http.patch<UpdateUserRoleResponse>(
    `/users/${userId}/role`,
    updateUserRoleRequest
  )
}