// Client-safe storage utilities for Zustand persist
// These ensure localStorage/sessionStorage are only accessed on the client
import { createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

const localStorageClient: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {
      // Ignore storage errors
    }
  },
};

const sessionStorageClient: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(name, value);
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(name);
    } catch {
      // Ignore storage errors
    }
  },
};

// Cookie-based storage for auth (avoids local/session storage)
const cookieStorageClient: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    try {
      const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${encodeURIComponent(name)}=`));
      if (!cookie) return null;
      return decodeURIComponent(cookie.split('=')[1] || '');
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof document === 'undefined') return;
    try {
      // 7 day expiry, Lax for safety
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
      )}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
    } catch {
      // Ignore cookie errors
    }
  },
  removeItem: (name: string): void => {
    if (typeof document === 'undefined') return;
    try {
      document.cookie = `${encodeURIComponent(
        name
      )}=; Max-Age=0; Path=/; SameSite=Lax`;
    } catch {
      // Ignore cookie errors
    }
  },
};

export const createClientStorage = () => {
  return createJSONStorage(() => localStorageClient);
};

export const createClientSessionStorage = () => {
  return createJSONStorage(() => sessionStorageClient);
};

export const createClientCookieStorage = () => {
  return createJSONStorage(() => cookieStorageClient);
};

