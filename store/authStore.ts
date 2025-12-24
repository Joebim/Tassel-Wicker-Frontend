import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClientCookieStorage } from "@/utils/storage";
import type { User } from "@/types/user";

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  hasHydrated: boolean;
  setAuth: (payload: {
    user: User;
    token: string;
    refreshToken: string;
  }) => void;
  setUser: (user: User | null) => void;
  setTokens: (payload: { token: string; refreshToken: string }) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      hasHydrated: false,

      setAuth: ({ user, token, refreshToken }) => {
        set({ user, token, refreshToken });
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      setTokens: ({ token, refreshToken }) => {
        set({ token, refreshToken });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null });
      },
    }),
    {
      name: "auth-storage",
      skipHydration: true, // Skip hydration to prevent SSR mismatches
      storage: createClientCookieStorage(),
      onRehydrateStorage: () => (state, error) => {
        // Mark store as hydrated regardless of success/failure
        useAuthStore.setState({ hasHydrated: true });
      },
    }
  )
);
