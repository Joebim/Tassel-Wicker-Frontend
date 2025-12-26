import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    // Images are now hosted locally in /public/images
    // Keeping Cloudinary remotePattern for videos that may still use it
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    // Cache optimized images for 1 year (31536000 seconds)
    // This ensures Next.js Image component caches optimized versions
    minimumCacheTTL: 31536000,
  },
  
  // Turbopack configuration (empty for now - SVGR uses webpack)
  turbopack: {},
  
  // Webpack configuration for SVGR (SVGR doesn't fully support Turbopack yet)
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule: { test?: { test?: (str: string) => boolean } }) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule?.issuer,
        resourceQuery: { not: [...(fileLoaderRule?.resourceQuery?.not || []), /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // Configure for react-pdf
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    // Handle pdfjs-dist properly
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },
};

export default nextConfig;
