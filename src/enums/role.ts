export enum Role {
  GUEST = 'GUEST',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export const ROLE_RANK: Record<Role, number> = {
  [Role.GUEST]: 0,
  [Role.USER]: 1,
  [Role.MODERATOR]: 2,
  [Role.ADMIN]: 3,
  [Role.SUPER_ADMIN]: 4
}

export const ROLE_LABEL: Record<Role, string> = {
  [Role.GUEST]: '游客',
  [Role.USER]: '用户',
  [Role.MODERATOR]: '审核员',
  [Role.ADMIN]: '管理员',
  [Role.SUPER_ADMIN]: '超级管理员'
}

export function hasRole(role: Role | null | undefined, required: Role): boolean {
  if (!role) return false
  return ROLE_RANK[role] >= ROLE_RANK[required]
}
