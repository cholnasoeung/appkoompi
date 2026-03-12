import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
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

export const config = {
  matcher: ["/", "/login", "/register", "/api/tasks/:path*"],
};
