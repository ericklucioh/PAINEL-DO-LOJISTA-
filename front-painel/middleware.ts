import { NextRequest, NextResponse } from "next/server";
import { getUserRoleFromToken } from "@/lib/jwt";

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

function getToken(request: NextRequest) {
  return (
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ??
    request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ??
    null
  );
}

function getUserRole(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) {
    const role = getUserRoleFromToken(accessToken);
    if (role) {
      return role;
    }
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    return getUserRoleFromToken(refreshToken);
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getToken(request);
  const role = getUserRole(request);
  const hasSession = Boolean(token && role);

  if (pathname === "/" && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/login") && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/vendas")) &&
    !hasSession
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/admin/:path*", "/vendas/:path*"],
};
