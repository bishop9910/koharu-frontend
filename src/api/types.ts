import type { Role } from '@/enums/role'
import type { AvatarStatus, ImageStatus, ReviewStatus } from '@/enums/status'

/* ============================================================
 * 通用
 * ============================================================ */

export interface MessageResponse {
  message: string
}

export interface PaginationQuery {
  page: number
  limit: number
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Timestamps {
  createdAt: string
  updatedAt?: string
}

/* ============================================================
 * 用户
 * ============================================================ */

export interface UserAvatar {
  id: string
  path: string
  userId: string
  createdAt: string
}

/** 登录接口返回的用户信息 */
export interface AuthUser {
  id: string
  username: string
  role: Role
}

/** 用户公开资料 */
export interface UserPublicInfo {
  id: string
  username: string
  bio: string | null
  role: Role
  avatar: Pick<UserAvatar, 'path'> | null
  avatarUrl?: string | null
}

/** GET /users/me、GET /users/{id} */
export interface User extends Timestamps {
  id: string
  username: string
  email: string
  role: Role
  bio: string | null
  emailVerified: boolean
  reviewExempt: boolean
  avatar: UserAvatar | null
  deletedAt: string | null
}

/** GET /users（MODERATOR+） */
export interface UserListItem extends Timestamps {
  id: string
  username: string
  email: string
  role: Role
  bio: string | null
  emailVerified: boolean
  reviewExempt: boolean
  avatar: UserAvatar | null
  avatarUrl?: string | null
}

export type EditableUserFields = Pick<User, 'username' | 'email' | 'bio'>

/* ============================================================
 * 认证
 * ============================================================ */

export interface LoginRequest {
  username: string
  password: string
  encrypted: boolean
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: AuthUser
}

export interface PublicKeyResponse {
  publicKey: string
}

export interface VerifyPasswordRequest {
  password: string
  encrypted: boolean
}

export interface VerifyPasswordResponse {
  valid: boolean
  reauthToken: string
  expiresIn: number
}

/* ============================================================
 * 用户接口
 * ============================================================ */

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  bio?: string
  encrypted: boolean
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  bio?: string
}

export interface UpdateUserRoleRequest {
  role: Role
}

export interface ChangePasswordRequest {
  newPassword: string
  encrypted: boolean
}

/* ============================================================
 * 图片
 * ============================================================ */

export interface ImageItem extends Timestamps {
  id: string
  filename: string
  thumbnailPath: string
  thumbnailUrl: string
  mimeType: string
  size: number
  width: number
  height: number
  userId: string
  status: ImageStatus
  rejectReason: string | null
  editCount: number
  md5: string
}

export interface MyImageListItem extends ImageItem {
  archived: boolean
}

export interface PendingImage extends ImageItem {
  username: string
}

export interface ImageListQuery extends PaginationQuery {
  status?: ImageStatus
}

export interface MyImageListQuery extends PaginationQuery {
  status?: ImageStatus
}

export interface UploadImageResponse extends MessageResponse {
  image: ImageItem
}

export interface ModifyImageResponse extends MessageResponse {
  image: ImageItem
}

export interface ReviewImageRequest {
  status: ReviewStatus
  reason?: string
}

export interface DownloadLinkResponse {
  downloadUrl: string
  expiresInMs: number
}

export interface DownloadImageQuery {
  signature: string
  expires: string
}

/* ============================================================
 * 头像
 * ============================================================ */

export interface PendingAvatar {
  submissionId: string
  userId: string
  username: string
  status: AvatarStatus
  imageUrl: string
  createdAt: string
}

export interface AvatarSubmission {
  id: string
  status: AvatarStatus
  createdAt: string
  imageUrl: string
}

export interface UploadAvatarResponse extends MessageResponse {
  submission: AvatarSubmission
}

export interface ReviewAvatarRequest {
  status: AvatarStatus.APPROVED | AvatarStatus.REJECTED
  reason?: string
}

export interface ReviewAvatarResponse extends MessageResponse {
  status: AvatarStatus
  avatar: UserAvatar | null
}

/* ============================================================
 * 图集与标签
 * ============================================================ */

export interface Tag {
  id: string
  name: string
  createdAt: string
}

export interface Album extends Timestamps {
  id: string
  title: string
  description: string
  visibility: string
  locked: boolean
  ownerId: string
  owner: Pick<User, 'id' | 'username'>
  tags: Tag[]
  images: ImageItem[]
  imageCount?: number
}

export interface CreateAlbumRequest {
  title: string
  description?: string
  visibility: string
  tags: string[]
}

export interface UpdateAlbumRequest {
  title?: string
  description?: string
  visibility?: string
  tags?: string[]
}

export interface SearchAlbumsQuery extends PaginationQuery {
  q: string
  tags?: string[]
}

export interface AlbumImagesRequest {
  imageIds: string[]
}
