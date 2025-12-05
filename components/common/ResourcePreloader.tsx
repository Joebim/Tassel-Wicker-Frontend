'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { preloadImages } from '@/utils/imageCache';

// Map of routes to their critical resources
const routeResources: Record<string, { images?: string[]; videos?: string[] }> = {
  '/': {
    videos: ['/videos/loop-video.mp4'],
  },
  '/shop': {
    images: ['/images/headers/shop-header.jpg'],
  },
  '/contact': {
    images: ['/images/headers/contact-header.jpg'],
  },
  '/about': {
    images: ['/images/headers/about-header-alt.jpg'],
  },
  '/terms-of-service': {
    images: ['/images/headers/terms-header-desktop.jpg', '/images/headers/terms-header-mobile.jpg'],
  },
  '/cookie-policy': {
    images: ['/images/headers/cookie-policy-header.jpg'],
  },
  '/privacy-policy': {
    images: ['/images/headers/privacy-policy-header.jpg'],
  },
  '/returns': {
    images: ['/images/headers/returns-header.jpg'],
  },
  '/shipping': {
    images: ['/images/headers/shipping-header.jpg'],
  },
  '/corporate-bespoke': {
    images: ['/images/headers/corporate-bespoke-header.jpg', '/images/headers/corporate-bespoke-header-mobile.jpg'],
  },
};

// Preload resources for a given path
function preloadRouteResources(path: string) {
  const resources = routeResources[path] || {};
    
  // Preload images immediately with highest priority
  if (resources.images && resources.images.length > 0) {
    // Add preload link tags FIRST (happens synchronously)
      resources.images.forEach((src) => {
        const existing = document.querySelector(`link[rel="preload"][href="${src}"]`);
        if (!existing) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          link.setAttribute('fetchpriority', 'high');
        link.setAttribute('crossorigin', 'anonymous');
          // Insert at the beginning of head for highest priority
          document.head.insertBefore(link, document.head.firstChild);
        }
      });

    // Then preload using Image API (uses browser cache)
    preloadImages(resources.images).catch(() => {
      // Silently handle errors - browser will retry
    });
    }

  // Preload videos
    if (resources.videos) {
      resources.videos.forEach((src) => {
        const existing = document.querySelector(`link[rel="preload"][href="${src}"]`);
        if (!existing) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'video';
          link.href = src;
          link.setAttribute('fetchpriority', 'high');
          document.head.insertBefore(link, document.head.firstChild);
        }
      });
    }
}

export default function ResourcePreloader() {
  const pathname = usePathname();

  // Preload on mount and pathname change
  useEffect(() => {
    // Preload current route immediately
    preloadRouteResources(pathname);
  }, [pathname]);

  // Preload on route change (before navigation completes)
  useEffect(() => {
    // Intercept link hover to preload before navigation
    const handleMouseEnter = (e: MouseEvent) => {
      // Check if target is an Element (has closest method)
      if (!(e.target instanceof Element)) {
        return;
      }

      const target = e.target as Element;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      if (link && link.href) {
        try {
          const url = new URL(link.href);
          if (url.origin === window.location.origin) {
            preloadRouteResources(url.pathname);
          }
        } catch {
          // Invalid URL, ignore
        }
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);
    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, []);

  return null;
}

