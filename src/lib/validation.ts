// [공통 모듈] 입력값 검증 스키마 (zod 사용)
//
// zod란? 사용자가 입력한 데이터가 우리가 원하는 형식(필수 항목, 글자 수, 형식 등)에
// 맞는지 검사해주는 라이브러리. 여기서 정한 규칙에 안 맞으면 에러 메시지를 자동으로 만들어줌.

import { z } from "zod";

// 이미지 업로드 제한: 10MB
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

// 한국 휴대폰 번호 형식: 010-1234-5678 또는 01012345678 모두 허용
const PHONE_REGEX = /^01[0-9]-?\d{3,4}-?\d{4}$/;

export const reviewFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "성함은 2자 이상 입력해주세요.")
    .max(30, "성함이 너무 길어요."),

  email: z
    .string()
    .trim()
    .email("올바른 이메일 형식이 아니에요."),

  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "올바른 전화번호 형식이 아니에요. (예: 010-1234-5678)"),

  reviewImageBase64: z
    .string()
    .min(1, "리뷰 캡처 이미지를 첨부해주세요."),

  reviewImageMimeType: z
    .enum(ALLOWED_IMAGE_MIME_TYPES, {
      message: "PNG, JPG, WEBP 형식의 이미지만 업로드할 수 있어요.",
    }),

  agreePrivacy: z.literal(true, {
    message: "개인정보 수집 및 이용에 동의해주세요.",
  }),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

// 관리자 페이지에서 "지급완료" 처리할 때 보내는 값 검증
export const updateStatusSchema = z.object({
  submissionId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/, "월 형식이 올바르지 않아요. (예: 2026-08)"),
  status: z.enum(["대기", "지급완료"]),
});

export type UpdateStatusValues = z.infer<typeof updateStatusSchema>;