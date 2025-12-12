import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClientStorage } from "@/utils/storage";

interface PaymentStore {
  paymentIntentId: string | null;
  paymentIntentClientSecret: string | null;
  customerEmail: string | null;
  customerName: string | null;
  setPaymentIntent: (paymentIntentId: string, paymentIntentClientSecret: string) => void;
  setCustomerInfo: (email: string, name: string) => void;
  clearPaymentIntent: () => void;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      paymentIntentId: null,
      paymentIntentClientSecret: null,
      customerEmail: null,
      customerName: null,

      setPaymentIntent: (paymentIntentId: string, paymentIntentClientSecret: string) => {
        set({
          paymentIntentId,
          paymentIntentClientSecret,
        });
      },

      setCustomerInfo: (email: string, name: string) => {
        set({
          customerEmail: email,
          customerName: name,
        });
      },

      clearPaymentIntent: () => {
        set({
          paymentIntentId: null,
          paymentIntentClientSecret: null,
          customerEmail: null,
          customerName: null,
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

