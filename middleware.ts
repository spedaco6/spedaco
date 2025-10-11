import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/tokens';
import { cookies } from 'next/headers'
 
// 1. Specify protected and public routes
const protectedRoutes = ['/auth']
// const publicRoutes = ['/login', '/signup', '/']
 
export async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  // const isPublicRoute = publicRoutes.includes(path)
 
  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get('session')?.value || "";
  const session = await decrypt(cookie, "session");

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
  // 5. Redirect to /dashboard if the user is authenticated
  if (
    !isProtectedRoute &&
    session?.userId &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL(path, req.nextUrl))
  }
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}