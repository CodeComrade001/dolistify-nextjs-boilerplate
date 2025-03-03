// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (pathname.startsWith('/Dashboard') || pathname.startsWith('/Add_New_Task') || pathname.startsWith('/Update_Saved_Task')) {
    return NextResponse.next();
  }

  // Retrieve session token from cookies
  const token = req.cookies.get('session');
  if (!token) {
    // Redirect to login if token is missing
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // Verify the token using your secret
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error : unknown) {
    console.log("🚀 ~ middleware ~ error:", error)
    // If token is invalid or expired, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Apply the middleware to specific routes (optional)
export const config = {
  matcher: ['/dashboard/:path*', '/protected/:path*'],
};
