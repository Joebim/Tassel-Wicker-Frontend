import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClientStorage } from "@/utils/storage";

interface PaymentStore {
  paymentIntentId: string | null;
  paymentIntentClientSecret: string | null;
  setPaymentIntent: (paymentIntentId: string, paymentIntentClientSecret: string) => void;
  clearPaymentIntent: () => void;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      paymentIntentId: null,
      paymentIntentClientSecret: null,

      setPaymentIntent: (paymentIntentId: string, paymentIntentClientSecret: string) => {
        set({
          paymentIntentId,
          paymentIntentClientSecret,
        });
      },

      clearPaymentIntent: () => {
        set({
          paymentIntentId: null,
          paymentIntentClientSecret: null,
        });
      },
    }),
    {
      name: "payment-storage",
      skipHydration: true, // Skip hydration to prevent SSR mismatches
      storage: createClientStorage(),
    }
  )
);

