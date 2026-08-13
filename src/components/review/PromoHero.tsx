// [UI] 히어로(배지→타이틀→캐릭터, 겹침 없음) + 곡선 + 2차 카피 + CTA + 개별 스텝 카드
import Link from "next/link";

const APP_STORE_REVIEW_URL = "https://apps.apple.com/kr/app/mebook/id6474175466";
const GOOGLE_PLAY_REVIEW_URL = "https://play.google.com/store/apps/details?id=net.megastudy.android.mebook&hl=ko";

const STEPS = [
  { icon: "⭐", title: "리뷰 작성", desc: "앱 스토어에서 리뷰를 작성해주세요." },
  { icon: "📷", title: "작성한 리뷰 화면 캡처", desc: "작성된 리뷰 전체 내용이 보일 수 있도록 화면을 캡처해주세요", note: "캡처한 화면은 추후 이벤트 폼 양식에 업로드하는 용도로 사용됩니다" },
  { icon: "📝", title: "이벤트 참여 폼 작성", desc: "참여버튼을 통해 이벤트 폼 양식을 작성해주세요" },
  { icon: "🎁", title: "포인트 지급", desc: "작성일 기준 5영업일 이내에 포인트를 지급합니다." },
];

export default function PromoHero() {
  return (
    <div className="heroWrap">
      {/* 상단 컬러 배너 */}
      <section className="heroBanner">
        <div className="heroBannerContent">
          <span className="heroBadge">미북 앱 리뷰 이벤트</span>
          <h1 className="headline">리뷰 남기고 혜택 받자!</h1>

          <div className="heroCharacterWrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot.png" alt="미북 리뷰 이벤트 캐릭터" className="characterImg" />
          </div>
        </div>

        <svg className="heroBannerCurve" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M1440,65 L1440,100 L0,100 L0,65 Q720,-25 1440,65 Z" fill="#ffffff" />
        </svg>
      </section>

      {/* 화이트 섹션: 2차 카피 + CTA + 참여방법 */}
      <section className="heroBottomCopy">
        <p className="heroBottomText1">앱 스토어 리뷰를 작성해주신 회원님께</p>
        <p className="heroBottomText2">me포인트 2,000P 즉시 지급!</p>
      </section>

      <section className="ctaSection">
        <Link href="/apply" className="primaryCta">
          참여하기
        </Link>
      </section>

      <section className="stepsSection2">
        <p className="stepsSectionHeading">앱 리뷰 이벤트 참여방법 살펴보기</p>

        <div className="promoStepsList">
          {STEPS.map((step, i) => (
            <div className="promoStepCard" key={i}>
              <div className="promoStepIconWrap">
                <span className="promoStepIcon">{step.icon}</span>
                <span className="promoStepBadge">{i + 1}</span>
              </div>
              <div className="promoStepBody">
                <p className="promoStepTitle">{step.title}</p>
                <p className="promoStepDesc">{step.desc}</p>
                {step.note && <p className="promoStepNote">{step.note}</p>}

                {i === 0 && (
                  <>
                    <p className="stepStoreCaption">사용 중인 기기에 맞는 스토어를 선택해주세요.</p>
                    <div className="stepStoreRow">
                      <a href={APP_STORE_REVIEW_URL} className="stepStoreButton" target="_blank" rel="noreferrer">
                        App Store 리뷰 작성
                      </a>
                      <a href={GOOGLE_PLAY_REVIEW_URL} className="stepStoreButton" target="_blank" rel="noreferrer">
                        Google Play 리뷰 작성
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}