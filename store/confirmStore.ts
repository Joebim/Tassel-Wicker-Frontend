import { create } from "zustand";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmStore {
  state: ConfirmState;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  close: (confirmed: boolean) => void;
}

export const useConfirmStore = create<ConfirmStore>((set) => ({
  state: {
    isOpen: false,
    options: null,
    resolve: null,
  },

  confirm: (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      set({
        state: {
          isOpen: true,
          options,
          resolve,
        },
      });
    });
  },

  close: (confirmed: boolean) => {
    set((store) => {
      if (store.state.resolve) {
        store.state.resolve(confirmed);
      }
      return {
        state: {
          isOpen: false,
          options: null,
          resolve: null,
        },
      };
    });
  },
}));
