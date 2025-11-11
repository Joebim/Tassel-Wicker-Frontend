'use client';

import { useEffect } from 'react';

export default function PreconnectLinks() {
  useEffect(() => {
    // Check if links already exist
    const existingPreconnect = document.querySelector('link[rel="preconnect"][href="https://res.cloudinary.com"]');
    const existingDnsPrefetch = document.querySelector('link[rel="dns-prefetch"][href="https://res.cloudinary.com"]');

    // Add preconnect link if it doesn't exist
    if (!existingPreconnect) {
      const preconnectCloudinary = document.createElement('link');
      preconnectCloudinary.rel = 'preconnect';
      preconnectCloudinary.href = 'https://res.cloudinary.com';
      document.head.appendChild(preconnectCloudinary);
    }

    // Add dns-prefetch link if it doesn't exist
    if (!existingDnsPrefetch) {
      const dnsPrefetchCloudinary = document.createElement('link');
      dnsPrefetchCloudinary.rel = 'dns-prefetch';
      dnsPrefetchCloudinary.href = 'https://res.cloudinary.com';
      document.head.appendChild(dnsPrefetchCloudinary);
    }
  }, []);

  return null;
}

