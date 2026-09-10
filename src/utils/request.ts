// src/utils/request.ts
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
  }
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenProvider {
  getAccess(): string | null;
  getRefresh(): string | null;
  setTokens(pair: TokenPair): void;
  setAccess(accessToken: string): void;
  clear(): void;
}

let tokenProvider: TokenProvider | null = null;

export function setTokenProvider(provider: TokenProvider) {
  tokenProvider = provider;
}

function requireProvider(): TokenProvider {
  if (!tokenProvider) {
    throw new Error('[request] 未注入 TokenProvider，请先调用 setTokenProvider()');
  }
  return tokenProvider;
}

let onAuthFailed: () => void = () => {
  window.location.href = '/login';
};

export function setAuthFailedHandler(handler: () => void) {
  onAuthFailed = handler;
}

export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export class RequestError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null, message?: string) {
    super(message ?? RequestError.extractMessage(body) ?? `请求失败 (${status})`);
    this.name = 'RequestError';
    this.status = status;
    this.body = body;
  }

  static extractMessage(body: ApiErrorBody | null): string | null {
    if (!body) return null;
    if (Array.isArray(body.message)) return body.message.join('，');
    if (typeof body.message === 'string') return body.message;
    if (typeof body.error === 'string') return body.error;
    return null;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const REFRESH_URL = '/auth/refresh';
const AUTH_FAIL_STATUSES = [401];

const request: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000
});

const refreshClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  pendingQueue = [];
}

async function refreshAccessToken(): Promise<void> {
  const provider = requireProvider();
  const refreshToken = provider.getRefresh();
  if (!refreshToken) throw new Error('缺少 refresh token');

  const { data } = await refreshClient.post<{ accessToken: string; expiresIn: number }>(
    REFRESH_URL,
    { refreshToken }
  );

  if (!data?.accessToken) throw new Error('刷新接口未返回 accessToken');
  provider.setAccess(data.accessToken);
}

request.interceptors.request.use(
  (config) => {
    const access = tokenProvider?.getAccess();
    if (access) {
      config.headers = AxiosHeaders.from(config.headers);
      config.headers.set('Authorization', `Bearer ${access}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;

    let body: ApiErrorBody | null = error.response?.data ?? null;
    if (body instanceof Blob) {
      try {
        body = JSON.parse(await body.text()) as ApiErrorBody;
      } catch {
        body = null;
      }
    }

    const requestError = new RequestError(status ?? 0, body);

    const shouldRefresh =
      original &&
      status &&
      AUTH_FAIL_STATUSES.includes(status) &&
      !original._retry &&
      !original.skipAuthRefresh;

    if (!shouldRefresh) {
      return Promise.reject(requestError);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then(() => request(original))
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      await refreshAccessToken();
      flushQueue(null);
      return request(original);
    } catch (refreshError) {
      flushQueue(refreshError);
      tokenProvider?.clear();
      onAuthFailed();
      return Promise.reject(
        new RequestError(401, null, '登录已过期，请重新登录')
      );
    } finally {
      isRefreshing = false;
    }
  }
);

export const http = {
  get<T>(url: string, config?: import('axios').AxiosRequestConfig): Promise<T> {
    return request.get<T>(url, config).then((res) => res.data);
  },

  post<T>(
    url: string,
    data?: unknown,
    config?: import('axios').AxiosRequestConfig
  ): Promise<T> {
    return request.post<T>(url, data, config).then((res) => res.data);
  },

  put<T>(
    url: string,
    data?: unknown,
    config?: import('axios').AxiosRequestConfig
  ): Promise<T> {
    return request.put<T>(url, data, config).then((res) => res.data);
  },

  patch<T>(
    url: string,
    data?: unknown,
    config?: import('axios').AxiosRequestConfig
  ): Promise<T> {
    return request.patch<T>(url, data, config).then((res) => res.data);
  },

  delete<T>(url: string, config?: import('axios').AxiosRequestConfig): Promise<T> {
    return request.delete<T>(url, config).then((res) => res.data);
  },

  upload<T>(
    url: string,
    formData: FormData,
    config?: import('axios').AxiosRequestConfig
  ): Promise<T> {
    return request
      .post<T>(url, formData, {
        ...config,
        headers: {
          ...(config?.headers as Record<string, string>),
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((res) => res.data);
  },

  download(url: string, config?: import('axios').AxiosRequestConfig): Promise<Blob> {
    return request
      .get<Blob>(url, { ...config, responseType: 'blob' })
      .then((res) => res.data);
  },

  raw: request
};

export default http;