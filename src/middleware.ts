import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

// Define your JWT secret and encode it using TextEncoder.
// (Make sure to set JWT_SECRET in your environment variables.)
const secret = process.env.SESSION_SECRET || 'default_secret'
const encodedSecret = new TextEncoder().encode(secret)

// Define protected and public routes.
const protectedRoutes = ['/Dashboard', '/Add_New_Task', '/Update_Saved_Task']
const publicRoutes = ['/']

export default async function middleware(req: NextRequest) {
  const cookieStore = await cookies()

  try {
    console.log("🚀 ~ Middleware is running");

    // Get current pathname.
    const path = req.nextUrl.pathname;
    console.log("🚀 ~ Current Path:", path);

    // Determine if the route is protected or public.
    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);
    console.log("🚀 ~ Is Protected Route:", isProtectedRoute);
    console.log("🚀 ~ Is Public Route:", isPublicRoute);

    // Skip middleware if the route is neither public nor protected.
    if (!isProtectedRoute && !isPublicRoute) {
      console.log("🚀 ~ Skipping Middleware for unprotected route:", path);
      return NextResponse.next();
    }

    // Retrieve the JWT from cookies.
    const token = cookieStore.get('session_token')?.value;
    if (!token) {
      console.log("🚀 ~ No session token found");
      // If it's a protected route, redirect to login.
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
      }
      return NextResponse.next();
    }

    // Verify the JWT using jose's jwtVerify function.
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, encodedSecret, {
        algorithms: ['HS256'],
      });
      payload = verifiedPayload;
      console.log("🚀 ~ JWT verified, payload:", payload);
    } catch (err) {
      console.error("🚀 ~ JWT verification failed:", err);
      // On verification failure, redirect to login for protected routes.
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
      }
      return NextResponse.next();
    }
    // Create a new response and set the userId in a cookie and header.
    const response = NextResponse.next();
    // Set a cookie with the userId so that your Dashboard page can access it.
    response.cookies.set('userId', payload?.userId?.toString() || '', {
      // Configure options as needed (e.g., secure, sameSite).
      httpOnly: false, // Allow client-side JS to read this cookie.
      path: '/',      // Make it available on all pages.
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    });

    // If the route is public and the user is already authenticated,
    // you can redirect them to the Dashboard.
    if (isPublicRoute && payload?.userId && !path.startsWith('/Dashboard')) {
      console.log("🚀 ~ User already authenticated, redirecting to Dashboard");
      return NextResponse.redirect(new URL('/Dashboard', req.nextUrl));
    }

    return response;
  } catch (error: unknown) {
    console.error('🚀 ~ Error in middleware:', error);
    return NextResponse.next();
  }
}

// Set the middleware configuration.
// The runtime is forced to 'nodejs' to ensure that the crypto API from Node is available.
// (If all your code is edge compatible, you might be able to remove this, but it helps avoid the crypto error.)
export const config = {
  runtime: 'nodejs',
  matcher: ['/Dashboard', '/Add_New_Task', '/Update_Saved_Task', '/'],
};
