"use client";

import type { PaymentStatus, ReviewRecord } from "@/types/review";

const STATUS_OPTIONS: PaymentStatus[] = ["접수", "검토중", "지급완료", "반려"];

type Props = {
  record: ReviewRecord;
  month: string;
  onClose: () => void;
  onSave: (status: PaymentStatus) => void;
  pendingStatus: PaymentStatus;
  onChangePendingStatus: (status: PaymentStatus) => void;
  saving: boolean;
};

export default function ReviewDetailModal({
  record,
  onClose,
  onSave,
  pendingStatus,
  onChangePendingStatus,
  saving,
}: Props) {
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <p className="modalHeaderLabel">REVIEW INSPECTION MODAL</p>
            <h2 className="modalHeaderTitle">접수번호 {record.submissionId}</h2>
          </div>
          <button type="button" className="modalCloseBtn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="modalBody">
          <div className="modalInfoGrid">
            <div className="modalInfoBox">
              <p className="modalInfoBoxTitle">신청 정보</p>
              <p className="modalInfoRow">
                <span className="modalInfoKey">접수번호</span>
                <span>{record.submissionId}</span>
              </p>
              <p className="modalInfoRow">
                <span className="modalInfoKey">접수일시</span>
                <span>{record.submittedAt}</span>
              </p>
            </div>

            <div className="modalInfoBox">
              <p className="modalInfoBoxTitle">신청자 정보</p>
              <p className="modalInfoRow">
                <span className="modalInfoKey">성함</span>
                <span>{record.name}</span>
              </p>
              <p className="modalInfoRow">
                <span className="modalInfoKey">미북 이메일</span>
                <span>{record.email}</span>
              </p>
              <p className="modalInfoRow">
                <span className="modalInfoKey">전화번호</span>
                <span>{record.phone}</span>
              </p>
            </div>
          </div>

          <div className="modalImageSection">
            <div className="modalImageSectionHeader">
              <p className="modalInfoBoxTitle">리뷰 캡처 (클릭하면 확대됨)</p>
              
                 <a href={record.reviewImageUrl}
                target="_blank"
                rel="noreferrer"
                className="modalImageOpenLink"
              >
                원본 크게 보기
              </a>
            </div>
            <a href={record.reviewImageUrl} target="_blank" rel="noreferrer">
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src={record.reviewImageUrl}
    alt="리뷰 캡처"
    className="modalImagePreview"
    referrerPolicy="no-referrer"
    onError={(e) => {
      e.currentTarget.style.display = "none";
      const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
      if (fallback) fallback.style.display = "flex";
    }}
  />
  <div className="modalImageFallback">
    이미지를 바로 불러올 수 없어요. 클릭해서 새 탭에서 확인해주세요.
  </div>
</a>
          </div>

          <div className="modalStatusSection">
            <p className="modalInfoBoxTitle">접수 및 상태 관리</p>
            <p className="modalStatusCurrentLabel">
              현재: <span className="modalStatusCurrentValue">{record.status}</span>
            </p>
            <div className="modalStatusButtons">
  {STATUS_OPTIONS.map((s) => (
    <button
      key={s}
      type="button"
      className={`modalStatusBtn modalStatusBtn-${s} ${pendingStatus === s ? "isActive" : ""}`}
      onClick={() => onChangePendingStatus(s)}
      disabled={saving}
    >
      {s}
    </button>
  ))}
</div>
{saving && <p className="modalSavingHint">구글 시트에 반영 중이에요, 잠시만 기다려주세요...</p>}
          </div>
        </div>

        <div className="modalFooter">
          <button type="button" className="modalCancelBtn" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="modalSaveBtn"
            onClick={() => onSave(pendingStatus)}
            disabled={saving}
          >
            {saving ? "저장 중..." : "저장 및 적용"}
          </button>
        </div>
      </div>
    </div>
  );
}
