import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const protectedPaths = [
  '/api/favorites',
  '/favorites',
  '/dashboard',
  '/profile',
];


async function verifyAuth(token: string): Promise<boolean> {
 
  try {
   
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    
    const payloadBase64 = parts[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    
    
    if (!payload.id || !payload.email) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  
  const isProtectedPath = protectedPaths.some(prefix => 
    path.startsWith(prefix) || path === prefix
  );
  
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
 
  const authToken = request.cookies.get('auth_token')?.value;
  
  
  if (!authToken || !(await verifyAuth(authToken))) {
   
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
   
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}


export const config = {
  matcher: [
    '/api/favorites/:path*',
    '/favorites/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
  ],
};
