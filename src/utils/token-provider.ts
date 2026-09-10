// src/utils/token-provider.ts
import { useAuthStore } from '@/stores/auth';
import type { TokenProvider, TokenPair } from '@/utils/request';

function createPiniaTokenProvider(): TokenProvider {
  const store = useAuthStore();
  return {
    getAccess: () => store.accessToken || null,
    getRefresh: () => store.refreshToken || null,
    setTokens: (pair: TokenPair) => store.setTokens(pair),
    setAccess: (accessToken: string) => store.setAccess(accessToken),
    clear: () => store.clearTokens()
  };
}
const piniaTokenProvider = createPiniaTokenProvider()
export {
  piniaTokenProvider
}