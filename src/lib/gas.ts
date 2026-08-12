// [공통 모듈] Google Apps Script(GAS) 웹앱과 통신하는 함수 모음
//
// GAS_WEB_APP_URL / GAS_SHARED_SECRET: .env.local 에 저장된 값을 사용
// 이 파일의 함수들은 반드시 서버(API 라우트)에서만 호출한다.
// (브라우저에서 직접 GAS 주소를 호출하지 않도록 하기 위함 — 보안/URL 노출 방지)

import type { MonthSummary, PaymentStatus, ReviewRecord } from "@/types/review";
import type { ReviewFormValues } from "@/lib/validation";

function getGasUrl(): string {
  const url = process.env.GAS_WEB_APP_URL;
  if (!url) throw new Error("GAS_WEB_APP_URL 환경변수가 설정되지 않았습니다.");
  return url;
}

function getSharedSecret(): string {
  const secret = process.env.GAS_SHARED_SECRET;
  if (!secret) throw new Error("GAS_SHARED_SECRET 환경변수가 설정되지 않았습니다.");
  return secret;
}

// 폼 제출 데이터를 GAS로 전송 → GAS가 이번 달 시트에 한 줄 추가 + 이미지를 Drive에 저장
export async function submitReviewToSheet(
  data: ReviewFormValues
): Promise<{ ok: boolean; submissionId?: string; month?: string; error?: string }> {
  const response = await fetch(getGasUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "submit",
      secret: getSharedSecret(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      reviewImageBase64: data.reviewImageBase64,
      reviewImageMimeType: data.reviewImageMimeType,
    }),
  });

  return response.json();
}

// 특정 월의 전체 신청 목록 조회
export async function fetchReviewsByMonth(
  month: string
): Promise<{ ok: boolean; records?: ReviewRecord[]; error?: string }> {
  const url = `${getGasUrl()}?action=list&month=${encodeURIComponent(month)}&secret=${encodeURIComponent(
    getSharedSecret()
  )}`;
  const response = await fetch(url);
  return response.json();
}

// 존재하는 월별 시트 목록 + 월별 요약(전체수/지급완료수)
export async function fetchMonthSummaries(): Promise<{ ok: boolean; months?: MonthSummary[]; error?: string }> {
  const url = `${getGasUrl()}?action=months&secret=${encodeURIComponent(getSharedSecret())}`;
  const response = await fetch(url);
  return response.json();
}

// 관리자: 특정 신청 건의 지급 상태 업데이트
export async function updateReviewStatus(
  month: string,
  submissionId: string,
  status: PaymentStatus
): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch(getGasUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "updateStatus",
      secret: getSharedSecret(),
      month,
      submissionId,
      status,
    }),
  });

  return response.json();
}
