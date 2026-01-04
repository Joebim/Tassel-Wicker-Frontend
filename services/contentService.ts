import { apiFetch } from './apiClient';

export type ContentPage = 
  | "about"
  | "cookie-policy"
  | "privacy-policy"
  | "terms-of-service"
  | "returns"
  | "shipping";

export interface ContentData {
  id: string;
  page: ContentPage;
  title: string;
  content: string; // HTML or JSON string
  documentUrl?: string | null;
  updatedAt: string;
}

export interface AboutPageContent {
  heroImage: string;
  myWhyTitle: string;
  myWhyText1: string;
  myWhyText2: string;
  myWhyImage: string;
  ourStoryTitle: string;
  ourStoryText1: string;
  ourStoryText2: string;
  ourStoryImage: string;
  signature: string;
  signatureTitle: string;
  builtForTitle: string;
  builtForVideos: string[];
}

/**
 * Fetch public content for a specific page
 * @param page - The page identifier
 * @returns Content data from the API
 * @throws Error if the request fails
 */
export async function getContent(page: ContentPage): Promise<ContentData> {
  const data = await apiFetch<ContentData>(`/api/content/${page}`, {
    method: 'GET',
    auth: false, // Public endpoint, no auth required
  });
  return data;
}

/**
 * Parse About page content from JSON string
 * @param content - JSON string from API
 * @returns Parsed AboutPageContent object
 */
export function parseAboutContent(content: string): AboutPageContent {
  try {
    return JSON.parse(content) as AboutPageContent;
  } catch (error) {
    console.error('Failed to parse About page content:', error);
    throw new Error('Invalid About page content format');
  }
}

