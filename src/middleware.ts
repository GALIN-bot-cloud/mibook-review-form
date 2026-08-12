// [미들웨어] /admin 페이지 및 /api/admin/* API 접근 보호
// - 이 파일은 요청이 실제로 처리되기 "직전"에 항상 실행됨
// - 로그인 페이지/로그인 API는 예외로 통과시키고, 나머지 관리자 영역은 인증 토큰을 확인함

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE_NAME } from "@/lib/auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const isValid = token ? await verifyAdminSessionToken(token) : false;

  if (!isValid) {
    // API 요청이면 JSON으로 401 응답, 페이지 요청이면 로그인 페이지로 이동
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
