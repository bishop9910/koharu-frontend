// src/stores/user.ts
import { defineStore } from 'pinia';
import cache from '@/utils/cache';
import { login as loginApi } from '@/api/auth';
import { getSelfInfo } from '@/api/users';
import { useAuthStore } from '@/stores/auth';
import type {
  LoginRequest,
  LoginResponse,
  User,
  UserBaseInfo
} from '@/api/types';

const USER_KEY = 'user:info';

interface UserState {
  userInfo: UserBaseInfo | null;
  loading: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: cache.local.getJSON<UserBaseInfo>(USER_KEY),
    loading: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.userInfo,
    userId: (state) => state.userInfo?.id ?? '',
    username: (state) => state.userInfo?.username ?? '',
    role: (state) => state.userInfo?.role ?? null
  },

  actions: {
    setUserInfo(userInfo: UserBaseInfo) {
      this.userInfo = userInfo;
      cache.local.setJSON<UserBaseInfo>(USER_KEY, userInfo);
    },

    async login(loginRequest: LoginRequest): Promise<LoginResponse> {
      const res = await loginApi(loginRequest);
      useAuthStore().setTokens(res);
      this.setUserInfo(res.user);
      return res;
    },

    async fetchSelfInfo(): Promise<User> {
      this.loading = true;
      try {
        const user = await getSelfInfo();
        this.setUserInfo(user);
        return user;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      useAuthStore().clearTokens();
      this.clearUser();
    },

    clearUser() {
      this.userInfo = null;
      cache.local.remove(USER_KEY);
    }
  }
});
