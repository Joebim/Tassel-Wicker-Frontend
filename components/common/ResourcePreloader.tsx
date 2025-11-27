'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

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
    images: ['/images/headers/about-header.jpg'],
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
    images: ['/images/headers/corporate-bespoke-header.jpg'],
  },
};

export default function ResourcePreloader() {
  const pathname = usePathname();

  useEffect(() => {
    const resources = routeResources[pathname] || {};
    
    // Preload images immediately
    if (resources.images) {
      resources.images.forEach((src) => {
        // Check if link already exists
        const existing = document.querySelector(`link[rel="preload"][href="${src}"]`);
        if (!existing) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          link.setAttribute('fetchpriority', 'high');
          // Insert at the beginning of head for highest priority
          document.head.insertBefore(link, document.head.firstChild);
        }
      });
    }

    // Preload videos immediately
    if (resources.videos) {
      resources.videos.forEach((src) => {
        // Check if link already exists
        const existing = document.querySelector(`link[rel="preload"][href="${src}"]`);
        if (!existing) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'video';
          link.href = src;
          link.setAttribute('fetchpriority', 'high');
          // Insert at the beginning of head for highest priority
          document.head.insertBefore(link, document.head.firstChild);
        }
      });
    }
  }, [pathname]);

  return null;
}

