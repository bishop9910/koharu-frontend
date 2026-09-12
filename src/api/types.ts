import type { Role } from '@/enums/role';

/* ============================================================
 * 通用
 * ============================================================ */

/** 只含 message 的通用响应 */
export interface MessageResponse {
  message: string;
}

/** 分页请求参数 */
export interface PaginationQuery {
  page: number;
  limit: number;
}

/** 分页响应 */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPage: number;
}

/** 后端返回的审计时间戳 */
interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

/* ============================================================
 * 实体
 * ============================================================ */

/** 头像 */
export interface UserAvatar extends Timestamps {
  id: string;
  path: string;
}

export type UserAvatarRef = Pick<UserAvatar, "path">

/** 用户基础信息 */
export interface UserBaseInfo {
  id: string;
  username: string;
  role: Role;
}

/** 完整用户（列表 / 详情接口返回） */
export interface User extends UserBaseInfo, Timestamps {
  email: string;
  emailVerified: boolean;
  bio: string | null;
  avatar: UserAvatar | null;
}

export interface UserPublicInfo extends UserBaseInfo {
  bio: string | null,
  avatar: UserAvatarRef | null
}

export type UserRef = Pick<User, 'id' | 'username' | 'avatar'>;

export type EditableUserFields = Pick<User, 'username' | 'email' | 'bio'>;

/* ============================================================
 * Auth
 * ============================================================ */

export interface LoginRequest {
  username: string;
  password: string;
  encrypted: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserBaseInfo;
}

export interface PublicKeyResponse {
  publicKey: string
}

/* ============================================================
 * User
 * ============================================================ */

export interface NewUserRequest {
  username: string;
  password: string;
  role: Role;
  bio: string;
  encrypted: boolean;
}

export type NewUserResponse = User;

export type ListUserRequest = PaginationQuery;

export type ListUserResponse = Paginated<User>;

export type GetSelfInfoResponse = User;

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  encrypted: boolean;
}

export type ChangePasswordResponse = MessageResponse;

export type GetUserPublicInfoRequest = Pick<User, "id">;

export type GetUserPublicInfoResponse = UserPublicInfo;

export type GetUserInfoRequest = Pick<User, "id">;

export type GetUserInfoResponse = User;

export type UpdateUserRequest = Partial<EditableUserFields>;

export type UpdateUserResponse = User;

export type DeleteUserRequest = Pick<User, "id">;

export type DeleteUserResponse = MessageResponse;

export type UpdateUserRoleRequest = Pick<User, "role">;

export type UpdateUserRoleResponse = User

