import { useQuery } from '@tanstack/react-query';
import { getContent, parseAboutContent, type ContentPage, type ContentData, type AboutPageContent } from '@/services/contentService';

/**
 * Query key factory for content queries
 */
export const contentKeys = {
  all: ['content'] as const,
  page: (page: ContentPage) => [...contentKeys.all, page] as const,
};

/**
 * Hook to fetch content for a specific page
 * @param page - The page identifier
 * @param options - Query options
 */
export function useContent(page: ContentPage, options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  return useQuery<ContentData, Error>({
    queryKey: contentKeys.page(page),
    queryFn: () => getContent(page),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch and parse About page content
 * @param options - Query options
 */
export function useAboutContent(options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  const { data, ...rest } = useContent('about', options);

  return {
    ...rest,
    data: data ? {
      ...data,
      parsed: parseAboutContent(data.content),
    } : undefined,
    aboutContent: data ? parseAboutContent(data.content) : undefined,
  };
}

/**
 * Type for parsed About content with original data
 */
export type AboutContentData = ContentData & {
  parsed: AboutPageContent;
};

