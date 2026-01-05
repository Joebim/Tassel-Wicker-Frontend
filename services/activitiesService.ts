import { apiFetch } from './apiClient';

export type ActivityType =
  | "user.registered"
  | "user.login"
  | "user.login_failed"
  | "user.logout"
  | "user.password_reset_requested"
  | "user.password_reset"
  | "order.created"
  | "order.updated"
  | "order.cancelled"
  | "order.payment_received"
  | "cart.item_added"
  | "cart.item_updated"
  | "cart.item_removed"
  | "cart.cleared"
  | "product.created"
  | "product.updated"
  | "product.deleted"
  | "content.updated"
  | "category.created"
  | "category.updated"
  | "category.deleted";

export interface ActivityData {
  id: string;
  type: ActivityType;
  userId?: string;
  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    role: string;
  };
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ActivitiesResponse {
  activities: ActivityData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ActivityStats {
  activityCounts: Array<{
    type: ActivityType;
    count: number;
  }>;
  totalUniqueUsers: number;
  recentActivitiesCount: number;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface ActivitiesFilters {
  page?: number;
  limit?: number;
  type?: ActivityType;
  userId?: string;
  startDate?: string;
  endDate?: string;
  orderId?: string;
  productId?: string;
}

/**
 * Fetch activities with optional filters
 */
export async function getActivities(filters: ActivitiesFilters = {}): Promise<ActivitiesResponse> {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.type) params.append('type', filters.type);
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.orderId) params.append('orderId', filters.orderId);
  if (filters.productId) params.append('productId', filters.productId);

  const queryString = params.toString();
  const url = `/api/activities${queryString ? `?${queryString}` : ''}`;

  return apiFetch<ActivitiesResponse>(url, {
    method: 'GET',
    auth: true, // Admin/moderator only
  });
}

/**
 * Fetch activity statistics
 */
export async function getActivityStats(startDate?: string, endDate?: string): Promise<ActivityStats> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const url = `/api/activities/stats${queryString ? `?${queryString}` : ''}`;

  return apiFetch<ActivityStats>(url, {
    method: 'GET',
    auth: true, // Admin/moderator only
  });
}

/**
 * Fetch a specific activity by ID
 */
export async function getActivityById(id: string): Promise<ActivityData> {
  return apiFetch<ActivityData>(`/api/activities/${id}`, {
    method: 'GET',
    auth: true, // Admin/moderator only
  });
}

