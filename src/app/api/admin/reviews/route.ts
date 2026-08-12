// [API] /api/admin/reviews
// GET  ?month=2026-08 → 해당 월의 신청자 목록 조회
// GET  (month 파라미터 없음) → 존재하는 월별 요약(전체수/지급완료수) 목록 조회
// POST → 특정 신청 건의 지급 상태 업데이트 (지급완료 처리 버튼)
//
// 접근 권한 체크는 middleware.ts 에서 이미 처리됨 (로그인 안 되어 있으면 여기까지 오지 않음)

import { NextRequest, NextResponse } from "next/server";
import { fetchMonthSummaries, fetchReviewsByMonth, updateReviewStatus } from "@/lib/gas";
import { updateStatusSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");

  try {
    if (month) {
      const result = await fetchReviewsByMonth(month);
      return NextResponse.json(result, { status: result.ok ? 200 : 502 });
    }

    const result = await fetchMonthSummaries();
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "서버 오류: " + String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  try {
    const result = await updateReviewStatus(parsed.data.month, parsed.data.submissionId, parsed.data.status);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "서버 오류: " + String(err) }, { status: 500 });
  }
}
