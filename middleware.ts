import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Always allow access to auth pages
        if (req.nextUrl.pathname.startsWith("/login") || 
            req.nextUrl.pathname.startsWith("/signup")) {
          return true
        }
        // For other protected routes, require authentication
        return !!token
      },
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: [
    // Protected routes that require authentication
    "/profile/:path*",
    "/settings/:path*",
    "/messages/:path*",
    "/create-listing",
    "/edit-listing/:path*",
    "/favorites",
    "/my-listings",
    // Auth pages
    "/login",
    "/signup"
  ],
} 