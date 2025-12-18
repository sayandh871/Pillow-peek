
import { betterFetch } from "@better-fetch/fetch";
import { type Session } from "better-auth";
import { NextResponse, type NextRequest } from "next/server";

const authRoutes = ["/sign-in", "/sign-up"];
const protectedRoutes = ["/profile", "/checkout"];
const adminRoutes = ["/admin"];

export default async function proxy(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isProtectedRoute = protectedRoutes.some(route => pathName.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathName.startsWith(route));

  const { data } = await betterFetch<{
    session: Session;
    user: { role?: string };
  }>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  );

  if (!data) {
    if (isProtectedRoute || isAdminRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  if (isAdminRoute && data.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
