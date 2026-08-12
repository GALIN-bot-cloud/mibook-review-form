// [공통 모듈] 관리자 로그인 인증 토큰(JWT) 발급 및 검증
//
// 로그인 성공 시 이 토큰을 쿠키에 담아 브라우저에 저장하고,
// 이후 /admin 페이지나 /api/admin/* 요청마다 이 토큰이 유효한지 확인한다.

import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "mibook_admin_session";
const TOKEN_TTL_SECONDS = 60 * 60 * 8; // 8시간 동안 로그인 유지

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET 환경변수가 설정되지 않았습니다.");
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export const ADMIN_SESSION_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_SESSION_TTL_SECONDS = TOKEN_TTL_SECONDS;
