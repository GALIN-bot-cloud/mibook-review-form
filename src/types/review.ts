// [타입 정의] 리뷰 작성자 개인정보 데이터 구조

// 지급 상태: 시트의 "지급상태" 컬럼 값과 정확히 일치해야 함
export type PaymentStatus = "대기" | "지급완료";

// 사용자가 폼에서 제출하는 데이터 (제출 시점에 서버로 보내는 값)
export interface ReviewSubmissionInput {
  name: string; // 성함
  email: string; // 미북 앱에 가입된 이메일 주소
  phone: string; // 전화번호 (예: 010-1234-5678)
  reviewImageBase64: string; // 리뷰 캡처 이미지 (base64로 인코딩된 문자열)
  reviewImageMimeType: string; // 이미지 파일 형식 (예: "image/png")
}

// Google Sheets에 실제로 저장/조회되는 한 줄(row)의 데이터 구조
export interface ReviewRecord {
  submissionId: string; // 고유 식별자 (제출ID)
  submittedAt: string; // 제출일시 (ISO 문자열)
  name: string;
  email: string;
  phone: string;
  reviewImageUrl: string; // Google Drive에 저장된 이미지의 조회 링크
  status: PaymentStatus;
  paidAt: string | null; // 지급처리일시 (아직 지급 전이면 null)
}

// 관리자 페이지에서 월별 탭 목록을 보여줄 때 사용하는 요약 정보
export interface MonthSummary {
  month: string; // "2026-08" 형식
  totalCount: number; // 해당 월 전체 신청자 수
  paidCount: number; // 지급완료 처리된 수
}
