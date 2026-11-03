import type { Role } from '@/enums/role'
import type { AvatarStatus, ImageStatus, ReviewStatus } from '@/enums/status'

/* ============================================================
 * 通用
 * ============================================================ */

export interface MessageResponse {
  message: string
}

export interface PaginationQuery {
  page?: number
  limit?: number
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

export interface AvatarSummary {
  id: string
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
  avatarUrl: string | null
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
  updatedAt: string
}

/** GET /users（MODERATOR+） */
export interface UserListItem {
  id: string
  username: string
  email: string
  role: Role
  bio: string | null
  emailVerified: boolean
  avatar: UserAvatar | null
  avatarUrl: string | null
  createdAt: string
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

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  expiresIn: number
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

export interface ImageListItem {
  id: string
  filename: string
  thumbnailPath: string | null
  thumbnailUrl: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  userId: string | null
  status: ImageStatus
  createdAt: string
}

export interface MyImageListItem extends ImageListItem {
  rejectReason: string | null
  archived: boolean
}

export interface PendingImage extends ImageListItem {
  username: string | null
}

export interface ImageResponse {
  id: string
  filename: string
  thumbnailPath?: string | null
  thumbnailUrl: string
  mimeType: string
  size: number
  md5: string
  width: number | null
  height: number | null
  userId: string | null
  status: ImageStatus
  rejectReason?: string | null
  editCount: number
  createdAt: string
  updatedAt: string
}

export interface ImageListQuery extends PaginationQuery {
  status?: ImageStatus
}

export interface MyImageListQuery extends PaginationQuery {
  status?: ImageStatus
}

export interface UploadImageResponse extends MessageResponse {
  image: ImageResponse
}

export interface ModifyImageResponse extends MessageResponse {
  image: ImageResponse
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
  access_token?: string
}

/* ============================================================
 * 头像
 * ============================================================ */

export interface PendingAvatar {
  submissionId: string
  userId: string
  username: string | null
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
  status: AvatarStatus.APPROVED | AvatarStatus.REJECTED
  avatar: AvatarSummary | null
}

/* ============================================================
 * 图集与标签
 * ============================================================ */

export type AlbumVisibility = 'public' | 'private'
export type AlbumReviewStatus = 'none' | 'pending' | 'approved' | 'rejected'
export type AlbumReportStatus = 'pending' | 'verified' | 'dismissed' | 'resolved'

export interface AlbumOwner {
  id: string
  username: string
}

export interface AlbumTag {
  id: string
  name: string
}

export interface AlbumImage {
  id: string
  filename: string
  thumbnailPath: string | null
  thumbnailUrl: string
  status: ImageStatus
}

export interface AlbumSummary extends Timestamps {
  id: string
  title: string
  description: string | null
  visibility: AlbumVisibility
  locked: boolean
  ownerId: string | null
  owner: AlbumOwner | null
  tags: AlbumTag[]
  imageCount: number
  likeCount: number
  favoriteCount: number
  likedByMe: boolean
  favoritedByMe: boolean
  reviewStatus: AlbumReviewStatus
  reviewEditUsed: boolean
  reviewSubmittedAt: string | null
  reviewRound: number
  reviewedAt: string | null
  reviewRejectReason: string | null
  updatedAt: string
}

export interface AlbumDetail extends Omit<AlbumSummary, 'imageCount'> {
  images: AlbumImage[]
}

export interface AlbumReaction {
  albumId: string
  likeCount: number
  favoriteCount: number
  likedByMe: boolean
  favoritedByMe: boolean
}

export interface AlbumReportAlbum {
  id: string
  title: string
  visibility: AlbumVisibility
  reviewStatus: AlbumReviewStatus
  ownerId: string | null
  ownerUsername: string
}

export interface AlbumReportReporter {
  id: string
  username: string
}

export interface AlbumReportItem extends Timestamps {
  id: string
  albumId: string
  album: AlbumReportAlbum
  reporter: AlbumReportReporter | null
  reason: string
  detail: string | null
  status: AlbumReportStatus
  handledBy: string | null
  handledAt: string | null
  resolutionNote: string | null
}

export interface AlbumReviewReport {
  id: string
  reason: string
  detail: string | null
  status: AlbumReportStatus
  reporter: AlbumReportReporter | null
  createdAt: string
}

export interface AlbumReviewItem extends AlbumSummary {
  pendingImageCount: number
  reports: AlbumReviewReport[]
}

export interface CreateAlbumReportRequest {
  reason: string
  detail?: string
}

export interface HandleAlbumReportRequest {
  note?: string
}

export interface AlbumReportQuery extends PaginationQuery {
  status?: AlbumReportStatus
}

export interface ReviewAlbumRequest {
  status: ReviewStatus
  reason?: string
}

export interface ReviewAlbumResponse extends MessageResponse {
  approvedImages: number
  rejectedImages: number
  album: AlbumDetail
}

export interface CreateAlbumReportResponse extends MessageResponse {
  report: AlbumReportItem
}

export interface HandleAlbumReportResponse extends MessageResponse {
  report: AlbumReportItem
}


export interface CreateAlbumRequest {
  title: string
  description?: string
  visibility?: AlbumVisibility
  tags?: string[]
}

export interface UpdateAlbumRequest {
  title?: string
  description?: string
  visibility?: AlbumVisibility
  tags?: string[]
}

export interface SearchAlbumsQuery extends PaginationQuery {
  q?: string
  tags?: string[]
}

export interface AlbumImagesRequest {
  imageIds: string[]
}

export interface Tag {
  id: string
  name: string
  createdAt: string
}

/* ============================================================
 * 图库密钥
 * ============================================================ */

export type KeyRotationStatus = 'idle' | 'running' | 'failed'

export interface LibraryRotation {
  status: KeyRotationStatus
  total: number
  done: number
  error: string | null
}

export interface LibraryStatus {
  bootstrapped: boolean
  unlocked: boolean
  activeVersion: number
  rotation: LibraryRotation
}

export interface ChangeLibraryPasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface ChangeLibraryPasswordResponse extends MessageResponse {
  activeVersion: number
  rotationTotal: number
}

export interface UnlockLibraryRequest {
  password: string
}

/* ============================================================
 * 自审赦免
 * ============================================================ */

export interface ReviewExemptionItem {
  userId: string
  username: string
  role: Role
}

export interface ReviewExemptionListResponse {
  data: ReviewExemptionItem[]
  total: number
}

/* ============================================================
 * 审计日志
 * ============================================================ */

export interface AuditLog {
  id: string
  actorId: string | null
  actorUsername: string | null
  actorRole: Role | null
  action: string
  method: string | null
  path: string | null
  statusCode: number | null
  ip: string | null
  userAgent: string | null
  durationMs: number | null
  detail: Record<string, unknown> | null
  success: boolean
  createdAt: string
}

export interface AuditLogQuery extends PaginationQuery {
  actorId?: string
  action?: string
  from?: string
  to?: string
}
