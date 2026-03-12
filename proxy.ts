import { withAuth } from "next-auth/middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { authEnabled } from "@/auth";

const authenticatedProxy = withAuth(
  function proxy(request) {
    const isAuthenticated = Boolean(request.nextauth.token);
    const isAuthPage =
      request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register";

    if (isAuthenticated && isAuthPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const isProtectedRoute =
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname.startsWith("/api/tasks");

        if (!isProtectedRoute) {
          return true;
        }

        return Boolean(token);
      },
    },
  }
);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!authEnabled) {
    return NextResponse.next();
  }

  return authenticatedProxy(request as never, event);
}

export const config = {
  matcher: ["/", "/login", "/register", "/api/tasks/:path*"],
};
