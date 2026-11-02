export enum ImageStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected'
}

export enum AvatarStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected'
}

export const IMAGE_STATUS_LABEL: Record<ImageStatus, string> = {
  [ImageStatus.APPROVED]: '已通过',
  [ImageStatus.PENDING]: '待审核',
  [ImageStatus.REJECTED]: '未通过'
}

export const AVATAR_STATUS_LABEL: Record<AvatarStatus, string> = {
  [AvatarStatus.APPROVED]: '已通过',
  [AvatarStatus.PENDING]: '待审核',
  [AvatarStatus.REJECTED]: '未通过'
}

export type ReviewStatus = ImageStatus.APPROVED | ImageStatus.REJECTED
