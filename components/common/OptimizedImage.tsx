'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  retryCount?: number;
  retryDelay?: number;
  fallbackSrc?: string;
}

/**
 * Optimized Image component with error handling and retry logic
 * Prevents image loading failures on first route
 */
export default function OptimizedImage({
  src,
  alt,
  retryCount = 3,
  retryDelay = 1000,
  fallbackSrc,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [retries, setRetries] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset when src changes - using callback to avoid setState in effect warning
  useEffect(() => {
    if (imageSrc !== src) {
      setImageSrc(src);
      setRetries(0);
      setHasError(false);
      setIsLoading(true);
    }
  }, [src, imageSrc]);

  const handleError = () => {
      if (retries < retryCount) {
        // Retry after delay with exponential backoff
        const delay = retryDelay * Math.pow(2, retries);
        setTimeout(() => {
          setRetries(prev => prev + 1);
          // Force reload by appending timestamp
          const srcString = typeof src === 'string' ? src : (typeof src === 'object' && 'src' in src ? src.src : '');
          setImageSrc(`${srcString}${srcString.includes('?') ? '&' : '?'}retry=${retries + 1}&t=${Date.now()}`);
        }, delay);
    } else {
      // All retries failed
      setHasError(true);
      setIsLoading(false);
      if (fallbackSrc) {
        setImageSrc(fallbackSrc);
        setHasError(false);
      }
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // If using fill prop, we can't use onError directly, so we need a wrapper
  if (props.fill) {
    return (
      <div className="relative w-full h-full">
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        <Image
          {...props}
          src={imageSrc}
          alt={alt}
          onError={handleError}
          onLoad={handleLoad}
          onLoadingComplete={handleLoad}
        />
        {hasError && !fallbackSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-sm">Failed to load image</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        onLoadingComplete={handleLoad}
      />
      {hasError && !fallbackSrc && (
        <div className="flex items-center justify-center bg-gray-200 p-4">
          <span className="text-gray-400 text-sm">Failed to load image</span>
        </div>
      )}
    </>
  );
}

