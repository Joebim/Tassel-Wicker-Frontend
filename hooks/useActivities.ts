import { useQuery } from '@tanstack/react-query';
import { getActivities, getActivityStats, type ActivitiesFilters, type ActivityStats } from '@/services/activitiesService';

/**
 * Query key factory for activities queries
 */
export const activitiesKeys = {
  all: ['activities'] as const,
  lists: () => [...activitiesKeys.all, 'list'] as const,
  list: (filters: ActivitiesFilters) => [...activitiesKeys.lists(), filters] as const,
  stats: (startDate?: string, endDate?: string) => [...activitiesKeys.all, 'stats', startDate, endDate] as const,
  detail: (id: string) => [...activitiesKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch activities with optional filters
 */
export function useActivities(filters: ActivitiesFilters = {}, options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  return useQuery({
    queryKey: activitiesKeys.list(filters),
    queryFn: () => getActivities(filters),
    staleTime: options?.staleTime ?? 30 * 1000, // 30 seconds default (activities change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch activity statistics
 */
export function useActivityStats(startDate?: string, endDate?: string, options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  return useQuery<ActivityStats>({
    queryKey: activitiesKeys.stats(startDate, endDate),
    queryFn: () => getActivityStats(startDate, endDate),
    staleTime: options?.staleTime ?? 60 * 1000, // 1 minute default
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

