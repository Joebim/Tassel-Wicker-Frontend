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

export const createClientStorage = () => {
  return createJSONStorage(() => localStorageClient);
};

export const createClientSessionStorage = () => {
  return createJSONStorage(() => sessionStorageClient);
};

