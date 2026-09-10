// src/stores/auth.ts
import { defineStore } from 'pinia';
import cache from '@/utils/cache';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const TOKEN_KEY = 'auth:token';

interface AuthState {
  accessToken: string;
  refreshToken: string;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const persisted = cache.local.getJSON<TokenPair>(TOKEN_KEY);
    return {
      accessToken: persisted?.accessToken ?? '',
      refreshToken: persisted?.refreshToken ?? ''
    };
  },

  getters: {
    isLogin: (state) => !!state.accessToken
  },

  actions: {
    setTokens(pair: TokenPair) {
      this.accessToken = pair.accessToken;
      this.refreshToken = pair.refreshToken;
      cache.local.setJSON<TokenPair>(TOKEN_KEY, pair);
    },

    setAccess(accessToken: string) {
      this.accessToken = accessToken;
      const current = cache.local.getJSON<TokenPair>(TOKEN_KEY);
      if (current) {
        cache.local.setJSON<TokenPair>(TOKEN_KEY, {
          ...current,
          accessToken
        });
      }
    },

    clearTokens() {
      this.accessToken = '';
      this.refreshToken = '';
      cache.local.remove(TOKEN_KEY);
    }
  }
});