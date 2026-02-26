export type SafeStorage = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
};

/**
 * localStorage wrapper that never throws.
 * (Safari private mode, quota exceeded, blocked storage, etc.)
 */
export function safeLocalStorage(): SafeStorage {
  return {
    getItem: (name) => {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        window.localStorage.setItem(name, value);
      } catch {
        // ignore
      }
    },
    removeItem: (name) => {
      try {
        window.localStorage.removeItem(name);
      } catch {
        // ignore
      }
    },
  };
}
