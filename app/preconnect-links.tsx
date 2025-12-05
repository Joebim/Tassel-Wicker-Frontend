'use client';

import { useEffect } from 'react';

export default function PreconnectLinks() {
  useEffect(() => {
    // Note: We no longer use Cloudinary for images (they're all local now)
    // Keeping this component for potential future external resource preconnects
    // Videos are still hosted on Cloudinary, but preconnect is less critical for videos
  }, []);

  return null;
}

