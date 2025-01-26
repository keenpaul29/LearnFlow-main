import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register');

  // If user is on auth page and has token and is NOT just registered, redirect to dashboard
  if (isAuthPage && authToken) {
    // Check if the token is very recent (within 5 seconds of creation)
    const tokenCreationTime = request.cookies.get('token-creation-time')?.value;
    if (!tokenCreationTime || (Date.now() - parseInt(tokenCreationTime) > 5000)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If user is not on auth page and has no token, redirect to login
  if (!isAuthPage && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protect all routes except public ones
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
