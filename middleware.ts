import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Log all API requests to help debug
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`[MIDDLEWARE] API Request: ${request.method} ${request.nextUrl.pathname} at ${new Date().toISOString()}`);
    
    // Log query parameters
    if (request.nextUrl.search) {
      console.log(`[MIDDLEWARE] Query params: ${request.nextUrl.search}`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};


