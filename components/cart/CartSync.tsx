'use client';

import { useCartSync } from '@/hooks/useCartSync';

/**
 * Component to handle cart synchronization with backend
 * Should be included in the app layout
 */
export default function CartSync() {
  useCartSync();
  return null; // This component doesn't render anything
}

