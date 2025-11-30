/**
 * Image caching utility to prevent re-fetching of already loaded images
 * Uses browser's native cache and in-memory tracking
 */

// In-memory cache to track loaded images
const loadedImages = new Set<string>();

/**
 * Preloads an image and caches it with retry logic
 * @param src - Image URL to preload
 * @param retries - Number of retry attempts (default: 2)
 * @returns Promise that resolves when image is loaded/cached
 */
export function preloadAndCacheImage(src: string, retries: number = 2): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already in cache
    if (loadedImages.has(src)) {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = retries + 1;

    const attemptLoad = () => {
      attempts++;
      
      // Check browser cache by creating an image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        loadedImages.add(src);
        resolve();
      };
      
      img.onerror = (error) => {
        if (attempts < maxAttempts) {
          // Retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
          setTimeout(attemptLoad, delay);
        } else {
          // All retries failed, but don't reject - let browser handle it
          // This prevents blocking other images from loading
          resolve();
        }
      };
      
      // Set src to trigger load (browser will use cache if available)
      // Add cache-busting query param only on retries
      const loadSrc = attempts > 1 ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempts}` : src;
      img.src = loadSrc;
    };

    attemptLoad();
  });
}

/**
 * Preloads multiple images
 * @param sources - Array of image URLs
 * @returns Promise that resolves when all images are loaded
 */
export async function preloadImages(sources: string[]): Promise<void> {
  const promises = sources.map(src => 
    preloadAndCacheImage(src).catch(() => {
      // Silently fail for individual images
    })
  );
  await Promise.all(promises);
}

/**
 * Checks if an image is already cached
 * @param src - Image URL to check
 * @returns true if image is cached
 */
export function isImageCached(src: string): boolean {
  return loadedImages.has(src);
}

/**
 * Clears the image cache (useful for testing or memory management)
 */
export function clearImageCache(): void {
  loadedImages.clear();
}

