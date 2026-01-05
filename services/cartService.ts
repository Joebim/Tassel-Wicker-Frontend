import { apiFetch } from './apiClient';

export interface CartItem {
  id: string; // Unique item identifier (productId or productId-variantSlug)
  productId: string; // Product ID
  name: string; // Product name
  price: number; // Item price (in cents or base currency unit)
  image: string; // Product image URL
  category: string; // Product category
  description: string; // Product description
  quantity: number; // Quantity in cart
  variantName?: string; // Optional variant name (e.g., "Large", "Red")
  customItems?: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
  }>; // For custom baskets
  basketItems?: Array<{
    name: string;
    image: string;
    category: string;
  }>; // For normal baskets
  createdAt?: string; // ISO 8601 timestamp
  updatedAt?: string; // ISO 8601 timestamp
}

export interface Cart {
  id: string; // Cart ID (user ID for logged-in users, session ID for guests)
  userId?: string; // User ID if logged in
  sessionId?: string; // Session ID for guest carts
  items: CartItem[]; // Array of cart items
  totalPrice: number; // Total cart price (calculated)
  totalItems: number; // Total item count (calculated)
  lastSyncedAt?: string; // ISO 8601 timestamp of last sync
  createdAt?: string; // ISO 8601 timestamp
  updatedAt?: string; // ISO 8601 timestamp
}

export interface SyncCartRequest {
  localCart: CartItem[]; // Cart items from client (localStorage)
  lastSyncedAt?: string; // Last sync timestamp from client
  mergeStrategy?: "local" | "server" | "merge"; // How to handle conflicts
}

export interface SyncCartResponse {
  cart: Cart; // Merged/synced cart
  conflicts?: Array<{
    itemId: string;
    localQuantity: number;
    serverQuantity: number;
    resolution: "local" | "server" | "combined";
  }>;
  syncedAt: string; // ISO 8601 timestamp
}

export interface AddItemRequest {
  item: Omit<CartItem, "quantity" | "createdAt" | "updatedAt">;
}

export interface AddItemResponse {
  cart: Cart;
  item: {
    id: string;
    quantity: number;
  };
}

export interface UpdateQuantityRequest {
  quantity: number;
}

export interface UpdateQuantityResponse {
  cart: Cart;
  item: {
    id: string;
    quantity: number;
  };
}

export interface RemoveItemResponse {
  cart: Cart;
  removedItemId: string;
}

/**
 * Get user's cart
 */
export async function getCart(): Promise<{ cart: Cart }> {
  return apiFetch<{ cart: Cart }>('/api/cart', {
    method: 'GET',
    auth: true,
  });
}

/**
 * Add item to cart
 */
export async function addCartItem(item: Omit<CartItem, "quantity" | "createdAt" | "updatedAt">, quantity: number = 1): Promise<AddItemResponse> {
  // Backend expects item with quantity field
  const itemWithQuantity = {
    ...item,
    quantity,
  };
  return apiFetch<AddItemResponse>('/api/cart/items', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ item: itemWithQuantity }),
  });
}

/**
 * Update item quantity in cart
 */
export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<UpdateQuantityResponse> {
  return apiFetch<UpdateQuantityResponse>(`/api/cart/items/${itemId}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify({ quantity }),
  });
}

/**
 * Remove item from cart
 */
export async function removeCartItem(itemId: string): Promise<RemoveItemResponse> {
  return apiFetch<RemoveItemResponse>(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    auth: true,
  });
}

/**
 * Clear cart
 */
export async function clearCart(): Promise<{ cart: Cart }> {
  return apiFetch<{ cart: Cart }>('/api/cart', {
    method: 'DELETE',
    auth: true,
  });
}

/**
 * Sync local cart with server cart
 */
export async function syncCart(request: SyncCartRequest): Promise<SyncCartResponse> {
  return apiFetch<SyncCartResponse>('/api/cart/sync', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(request),
  });
}

/**
 * Merge guest cart on login
 */
export async function mergeGuestCart(guestCart: CartItem[]): Promise<{ cart: Cart; mergedItems: string[] }> {
  return apiFetch<{ cart: Cart; mergedItems: string[] }>('/api/cart/merge-guest', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ guestCart }),
  });
}

