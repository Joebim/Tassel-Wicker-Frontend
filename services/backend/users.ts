import { apiFetch } from "@/services/apiClient";
import type { User, UserRole } from "@/types/user";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
}

export interface GetUsersResponse {
  items: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  isEmailVerified?: boolean;
}

/**
 * List all users with pagination, filtering and search
 */
export async function getUsers(params: GetUsersParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);

  return apiFetch<GetUsersResponse>(`/api/users?${query.toString()}`, {
    method: "GET",
    auth: true,
  });
}

/**
 * Get a single user by ID
 */
export async function getUser(id: string) {
  return apiFetch<{ item: User }>(`/api/users/${id}`, {
    method: "GET",
    auth: true,
  });
}

/**
 * Update a user's profile
 */
export async function updateUser(id: string, data: UpdateUserRequest) {
  return apiFetch<{ item: User }>(`/api/users/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
}

/**
 * Delete a user
 */
export async function deleteUser(id: string) {
  return apiFetch<{ success: boolean }>(`/api/users/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferences?: {
    newsletter?: boolean;
    marketing?: boolean;
    currency?: string;
    language?: string;
  };
}

/**
 * Update authenticated user's profile
 */
export async function updateMyProfile(data: UpdateUserProfileRequest) {
  return apiFetch<{ item: User }>("/api/users/me", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(data),
  });
}
