// [공개 페이지] 미북 앱 리뷰 작성자용 히어로(첫 화면)
import PromoHero from "@/components/review/PromoHero";
import SparkleDiamonds from "@/components/review/SparkleDiamonds";

export default function ReviewFormPage() {
  return (
    <div className="page-bg">
      <SparkleDiamonds />
      <div className="page-inner">
        <PromoHero />
      </div>
    </div>
  );
}