// [API] POST /api/submit-review
// 역할: 사용자가 제출한 리뷰 작성자 개인정보를 서버에서 받아
//       Google Apps Script 웹앱(GAS_WEB_APP_URL)으로 전달(proxy)한다.
// 이렇게 서버를 한 번 거치는 이유:
//   1) GAS 웹앱 주소를 브라우저(클라이언트)에 노출하지 않기 위해
//   2) 서버 쪽에서 한 번 더 입력값 검증(zod)을 하기 위해

import { NextRequest, NextResponse } from "next/server";
import { reviewFormSchema, MAX_IMAGE_SIZE_BYTES } from "@/lib/validation";
import { submitReviewToSheet } from "@/lib/gas";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const parsed = reviewFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  // base64 문자열 길이로 대략적인 이미지 용량 확인 (base64는 원본보다 약 1.37배 큼)
  const estimatedBytes = (parsed.data.reviewImageBase64.length * 3) / 4;
  if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json({ ok: false, error: "이미지 용량이 너무 큽니다. (최대 5MB)" }, { status: 400 });
  }

  try {
    const result = await submitReviewToSheet(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error ?? "제출 처리 중 오류가 발생했습니다." }, { status: 502 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "서버 오류: " + String(err) }, { status: 500 });
  }
}
