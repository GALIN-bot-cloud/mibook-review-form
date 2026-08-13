// [공개 페이지] 리뷰 인증 신청폼
import ReviewForm from "@/components/ReviewForm";

export default function ApplyPage() {
  return (
    <div className="page-bg applyPageBg">
      <div className="page-inner">
        <div className="formSectionAnchor">
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}