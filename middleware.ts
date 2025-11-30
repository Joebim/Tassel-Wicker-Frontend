import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Log all API requests to help debug
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`[MIDDLEWARE] API Request: ${request.method} ${request.nextUrl.pathname} at ${new Date().toISOString()}`);
    
    // Log query parameters
    if (request.nextUrl.search) {
      console.log(`[MIDDLEWARE] Query params: ${request.nextUrl.search}`);
    }
  }

  // Add cache headers for Next.js Image optimization requests
  if (request.nextUrl.pathname.startsWith('/_next/image')) {
    // Cache optimized images for 1 year
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  // Add cache headers for static assets
  if (
    request.nextUrl.pathname.startsWith('/_next/static') ||
    request.nextUrl.pathname.startsWith('/images/') ||
    request.nextUrl.pathname.startsWith('/videos/')
  ) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/_next/image/:path*',
    '/_next/static/:path*',
    '/images/:path*',
    '/videos/:path*',
  ],
};


