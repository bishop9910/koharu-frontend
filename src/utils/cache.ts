// utils/cache.ts

export interface StorageAdapter {
  set(key: string, value: string): void;
  get(key: string): string | null;
  setJSON<T>(key: string, value: T): void;
  getJSON<T>(key: string): T | null;
  remove(key: string): void;
  clear(): void;
}

const isBrowser = typeof window !== 'undefined';

function createAdapter(
  storage: Storage | null,
  prefix = ''
): StorageAdapter {
  const withPrefix = (key: string) => `${prefix}${key}`;

  const adapter: StorageAdapter = {
    set(key, value) {
      if (!storage || key == null || value == null) return;
      try {
        storage.setItem(withPrefix(key), value);
      } catch (e) {
        console.error(`[cache] set "${key}" failed:`, e);
      }
    },

    get(key) {
      if (!storage || key == null) return null;
      return storage.getItem(withPrefix(key));
    },

    setJSON(key, value) {
      if (value == null) return;
      adapter.set(key, JSON.stringify(value));
    },

    getJSON<T>(key: string): T | null {
      const value = adapter.get(key);
      if (value == null) return null;
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        console.error(`[cache] parse "${key}" failed:`, e);
        return null;
      }
    },

    remove(key) {
      if (!storage) return;
      storage.removeItem(withPrefix(key));
    },

    clear() {
      if (!storage) return;
      storage.clear();
    }
  };

  return adapter;
}

const emptyAdapter: StorageAdapter = {
  set: () => {},
  get: () => null,
  setJSON: () => {},
  getJSON: () => null,
  remove: () => {},
  clear: () => {}
};

export interface CacheManager {
  session: StorageAdapter;
  local: StorageAdapter;
}

const APP_PREFIX = 'app:';

const cache: CacheManager = {
  session: isBrowser
    ? createAdapter(sessionStorage, APP_PREFIX)
    : emptyAdapter,
  local: isBrowser
    ? createAdapter(localStorage, APP_PREFIX)
    : emptyAdapter
};

export default cache;