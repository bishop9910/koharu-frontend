import { defineStore } from 'pinia'
import cache from '@/utils/cache'
import { useAuthStore } from '@/stores/auth'
import type { AuthUser } from '@/api/types'

const USER_KEY = 'user:info'

interface UserState {
  userInfo: AuthUser | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: cache.local.getJSON<AuthUser>(USER_KEY)
  }),

  getters: {
    isLoggedIn: (state) => !!state.userInfo,
    userId: (state) => state.userInfo?.id ?? '',
    username: (state) => state.userInfo?.username ?? '',
    role: (state) => state.userInfo?.role ?? null
  },

  actions: {
    setUserInfo(userInfo: AuthUser) {
      this.userInfo = userInfo
      cache.local.setJSON<AuthUser>(USER_KEY, userInfo)
    },

    clearUser() {
      this.userInfo = null
      cache.local.remove(USER_KEY)
    },

    logout() {
      useAuthStore().clearTokens()
      this.clearUser()
    }
  }
})
