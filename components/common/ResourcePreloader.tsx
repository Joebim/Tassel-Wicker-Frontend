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
    images: ['https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761524366/PROPOSED_HEADER_IMAGE_FOR_PRODUCT_PAGE_mdcg8y.jpg'],
  },
  '/contact': {
    images: ['https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761149638/_2MK9323_vyzwqm.jpg'],
  },
  '/about': {
    images: ['https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761542804/IMAGE_SEVEN_w8mzsc.jpg'],
  },
  '/terms-of-service': {
    images: ['https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1764234390/_2MK9067_xy8vh2.jpg', 'https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1764234469/_2MK9038_zdzsag.jpg'],
  },
  '/cookie-policy': {
    images: ['https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1763661133/COOKIE_POLICY_syh1yx.jpg'],
  },
  '/privacy-policy': {
    images: ['https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1763661131/PRIVACY_POLICY_ntaqhz.jpg'],
  },
  '/returns': {
    images: ['https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1763661126/RETURNS_AND_EXCHANGE_1_oubewa.jpg'],
  },
  '/shipping': {
    images: ['https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1763659377/SHIPPING_INFORMATION_ipsodq.jpg'],
  },
  '/corporate-bespoke': {
    images: ['https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761542830/IMAGE_FIVE_c3hzmh.jpg', 'https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1764234469/_2MK9038_zdzsag.jpg'],
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

