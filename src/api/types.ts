import type { Role } from '@/enums/role';
import { blob } from 'stream/consumers';
import { effectScope } from 'vue';

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
export interface Timestamps {
  createdAt: string;
  updatedAt?: string;
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
  email: string;
  role: Role;
}

/** 完整用户（列表 / 详情接口返回） */
export interface User extends UserBaseInfo, Timestamps {
  id: string;
  usename: string;
  email: string;
  role: Role;
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

export interface image extends Timestamps {
  id: string;
  filename: string;
  path?: string;
  thumbnailPath: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  userId?: string;
  md5?: string;
  status?: string;
  rejectReason: string | null;
  reviewedBy: string | null;
  editCount?: number;
  uploaderIp?: string;
  thumbnailUrl?: string
}
export interface apporoveingImage {
  id: string,
  filename: string,
  thumbnailPath: string,
  mimeType: string,
  size: number,
  width: number,
  height: number,
  status: string,
  rejectReason: null,
  createdAt: string,
  archived: boolean
}

export interface tag {
  id: string;
  name: string;
  createAt: string
}

export interface album extends Timestamps {
  id: string,
  title: string,
  description: string,
  visibility: string,
  locked: boolean,
  ownerId: string,
  owner: {
    id: string,
    username: string
  },
  tags: tag[],
  images: image[],
  imageCount?: number
}

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
  email: string;
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

export type UpdateUserRoleResponse = User;

/* ============================================================
 * image
 * ============================================================ */

export interface uploadImageRequest {
  file: File
}

export interface uploadImageReponse extends MessageResponse, image { }

export interface getApprovedImageListaRequest {
  page: number;
  limit: number
}

export type getApprovedImageListResponse = Paginated<image>;

export interface approveImageRequest {
  status: string;
  reason: string
}

export type approveImageResponse = image;

export interface editImageRequest {
  file: File
}

export interface editImageResponse extends MessageResponse, image { }

export type getUploadImageListRequest = getApprovedImageListaRequest;

export type getUploadImageListResponse = Paginated<apporoveingImage>;

export type getThumbnailStreamResponse = Blob;

export interface getDownLinkResponse {
  downloadUrl: string;
  expiresInMs: number
}

export interface downImageRequest {
  singnature: string;
  expires: string
}

export type downImageResponse = Blob;

export type getImageDetailResponse = image;

export type deleteImageResponse = MessageResponse;

/* ============================================================
 * albums
 * ============================================================ */

export interface createAlbumsRequest {
  title: string;
  description: string;
  visibility: string;
  tags: string[]
}

export type createAlbumsResponse = album;

export type getAlbumsListRequest = PaginationQuery;

export type getAlbumsListResponse = Paginated<album>;

export interface searchAlbumsRequest extends PaginationQuery {
  q: string;
  tags: tag[]
}

export type searchAlbumsResponse = Paginated<album>;

export type getAlubumDetailResponse = album;

export interface editAlumRequest {
  title: string;
  description: string;
  visibility: string;
  tags: string[]
}

export type editAlumResponse = album;

export type deleteAlbumResponse = MessageResponse;

export type unlockAlbumResponse = album;

export interface archiveImagesRequest {
  imageIds: string[]
}

export type archiveImagesResponse = album;

export type removeImageRequest = archiveImagesRequest;

export type removeImageResponse = album;

/* ============================================================
 * tags
 * ============================================================ */

export type getTagListResponse = tag[];

export interface createTagRequest {
  name: string
}

export type createTagResponse = tag;

export type deleteTagResponse = MessageResponse;

/* ============================================================
 * avatars
 * ============================================================ */

export type uploadAvatarsRequest = File;

export interface uploadAvatarsResponse extends MessageResponse {
  submission: {
    id: string;
    status: string
  }
}

export type deleteAvatarsResponse = MessageResponse;

export interface apporoveAvatarsRequest {
  ststus: string;
  reason: string
}

export type getAvatarStreamResponse = Blob;




