import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './app/utils/supabase/middleware'

const PRIVATE_ROUTES = ['/Dashboard', '/Add_New_Task', '/Update_Saved_Task']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only run our guard on the listed private routes.
  if (PRIVATE_ROUTES.some((route) => pathname.startsWith(route))) {
    // Attempt to refresh / validate the user's session
    const sessionCheck = await updateSession(request)

    // If not authenticated, send them back to "/"
    if (!sessionCheck.success) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Authenticated → allow the request to continue
    return NextResponse.next()
  }

  // Public route → just continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/Dashboard/:path*',
    '/Add_New_Task/:path*',
    '/Update_Saved_Task/:path*',
  ],
}

