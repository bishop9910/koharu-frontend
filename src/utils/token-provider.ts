// src/utils/token-provider.ts
import { useAuthStore } from '@/stores/auth';
import type { TokenProvider, TokenPair } from '@/utils/request';

export const piniaTokenProvider: TokenProvider = {
  getAccess: () => getStore().accessToken || null,
  getRefresh: () => getStore().refreshToken || null,
  setTokens: (pair: TokenPair) => getStore().setTokens(pair),
  setAccess: (accessToken: string) => getStore().setAccess(accessToken),
  clear: () => getStore().clearTokens()
};

function getStore() {
  return useAuthStore();
}