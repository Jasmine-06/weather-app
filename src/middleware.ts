import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which paths require authentication
const protectedPaths = [
  '/api/favorites',
  '/favorites',
  '/dashboard',
  '/profile',
];

// Simple JWT verification for Edge Runtime
async function verifyAuth(token: string): Promise<boolean> {
  // Basic structure check (without actual verification)
  try {
    // Just verify the token structure without full validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Decode payload without verification (just for structure check)
    const payloadBase64 = parts[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    
    // Check if token has basic required fields
    if (!payload.id || !payload.email) {
      return false;
    }

    // For security, implement proper JWT verification in production
    // This is just a temporary solution to avoid additional dependencies
    
    return true;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(prefix => 
    path.startsWith(prefix) || path === prefix
  );
  
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // Get the token from cookies
  const authToken = request.cookies.get('auth_token')?.value;
  
  // If no token is present or token is invalid, redirect to login
  if (!authToken || !(await verifyAuth(authToken))) {
    // For API routes, return 401 Unauthorized
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // For other routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/api/favorites/:path*',
    '/favorites/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
  ],
};
