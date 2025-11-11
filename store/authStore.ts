import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClientStorage } from "@/utils/storage";

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      setUser: (user: User | null) => {
        set({ user });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: "auth-storage",
      skipHydration: true, // Skip hydration to prevent SSR mismatches
      storage: createClientStorage(),
    }
  )
);
