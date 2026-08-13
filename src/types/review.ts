// [타입 정의] 리뷰 작성자 개인정보 데이터 구조

// 상태: 시트의 "상태" 컬럼 값과 정확히 일치해야 함
export type PaymentStatus = "접수" | "검토중" | "지급완료" | "반려";

// 사용자가 폼에서 제출하는 데이터 (제출 시점에 서버로 보내는 값)
export interface ReviewSubmissionInput {
  name: string;
  email: string;
  phone: string;
  reviewImageBase64: string;
  reviewImageMimeType: string;
}

// Google Sheets에 실제로 저장/조회되는 한 줄(row)의 데이터 구조
export interface ReviewRecord {
  submissionId: string;
  submittedAt: string;
  name: string;
  email: string;
  phone: string;
  reviewImageUrl: string;
  status: PaymentStatus;
  paidAt: string | null;
}

// 관리자 페이지에서 월별 탭 목록을 보여줄 때 사용하는 요약 정보
export interface MonthSummary {
  month: string;
  totalCount: number;
  receivedCount: number;
  reviewingCount: number;
  completedCount: number;
  rejectedCount: number;
}