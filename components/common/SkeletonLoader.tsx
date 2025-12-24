'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-luxury-warm-grey/20';
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="border border-luxury-warm-grey/20 rounded-lg overflow-hidden bg-white">
      <Skeleton variant="rectangular" height={400} className="w-full" />
      <div className="p-6 space-y-4">
        <Skeleton variant="text" height={24} width="70%" />
        <Skeleton variant="text" height={20} width="50%" />
        <Skeleton variant="text" height={16} width="100%" />
        <Skeleton variant="text" height={16} width="80%" />
        <div className="flex items-center justify-between pt-4">
          <Skeleton variant="text" height={28} width={100} />
          <Skeleton variant="rectangular" height={40} width={120} />
        </div>
      </div>
    </div>
  );
};

// Product Grid Skeleton
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Product Detail Skeleton
export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Skeleton variant="rectangular" height={600} className="w-full" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={100} className="w-full" />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <Skeleton variant="text" height={48} width="80%" />
            <Skeleton variant="text" height={32} width="40%" />
            <div className="space-y-2">
              <Skeleton variant="text" height={20} width="100%" />
              <Skeleton variant="text" height={20} width="90%" />
              <Skeleton variant="text" height={20} width="85%" />
            </div>
            <div className="space-y-4 pt-4">
              <Skeleton variant="text" height={24} width="30%" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={50} width={80} />
                ))}
              </div>
            </div>
            <Skeleton variant="rectangular" height={56} width="100%" />
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <Skeleton variant="text" height={36} width={200} className="mb-8" />
          <ProductGridSkeleton count={3} />
        </div>
      </div>
    </div>
  );
};

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => {
  return (
    <div className="flex gap-4 p-4 border-b border-luxury-warm-grey/20">
      <Skeleton variant="rectangular" width={80} height={80} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" height={20} width="60%" />
        <Skeleton variant="text" height={16} width="40%" />
        <Skeleton variant="text" height={16} width="80%" />
      </div>
    </div>
  );
};

// Page Content Skeleton
export const PageContentSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 space-y-8">
      <Skeleton variant="text" height={48} width="60%" />
      <div className="space-y-4">
        <Skeleton variant="text" height={20} width="100%" />
        <Skeleton variant="text" height={20} width="95%" />
        <Skeleton variant="text" height={20} width="90%" />
      </div>
      <div className="space-y-4">
        <Skeleton variant="text" height={32} width="50%" />
        <Skeleton variant="text" height={20} width="100%" />
        <Skeleton variant="text" height={20} width="98%" />
        <Skeleton variant="text" height={20} width="92%" />
      </div>
    </div>
  );
};




