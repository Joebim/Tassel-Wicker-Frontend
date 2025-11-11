import { create } from "zustand";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast: Omit<Toast, "id">) => {
    // Generate ID only on client side to avoid hydration mismatches
    // This function should only be called on the client after mount
    let id: string;
    if (typeof window !== 'undefined' && crypto?.randomUUID) {
      id = crypto.randomUUID();
    } else {
      // Fallback: use a simple counter-based ID (only used if crypto.randomUUID is unavailable)
      // This should never happen in modern browsers, but provides a fallback
      const currentCounter = (globalThis as unknown as { __toastCounter?: number }).__toastCounter || 0;
      const counter = currentCounter + 1;
      (globalThis as unknown as { __toastCounter: number }).__toastCounter = counter;
      id = `toast-${counter}`;
    }
    const newToast: Toast = {
      id,
      duration: 4000,
      ...toast,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto remove toast after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, newToast.duration);
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));
