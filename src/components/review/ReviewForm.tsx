"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reviewFormSchema,
  type ReviewFormValues,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
} from "@/lib/validation";

type SubmitState = "idle" | "submitting" | "success" | "error";

const GUIDELINES = [
  "본 이벤트는 미북스토어 회원을 대상으로 하며, 상세 내용은 이벤트 페이지를 참고 부탁드립니다.",
  "제출하신 이미지가 실제 앱스토어/플레이스토어 리뷰와 일치하지 않을 경우 지급이 제한됩니다.",
  "1인 1회 참여 가능하며, 중복 및 부정 참여 시 지급이 취소될 수 있습니다.",
  "입력하신 정보가 정확하지 않을 경우 포인트 지급이 지연되거나 제한될 수 있습니다.",
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function ReviewForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFileError, setImageFileError] = useState<string | null>(null);
  const [showAgreeDetail, setShowAgreeDetail] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      reviewImageBase64: "",
      reviewImageMimeType: undefined,
      agreePrivacy: undefined,
    },
  });

  const hasImage = Boolean(watch("reviewImageBase64"));

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImageFileError(null);

    if (!file) {
      setValue("reviewImageBase64", "", { shouldValidate: true });
      setImagePreviewUrl(null);
      return;
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
      setImageFileError("PNG, JPG, WEBP 형식의 이미지만 업로드할 수 있어요.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageFileError("이미지 용량이 너무 커요. (최대 10MB)");
      e.target.value = "";
      return;
    }

    const base64 = await fileToBase64(file);
    setValue("reviewImageBase64", base64, { shouldValidate: true });
    setValue("reviewImageMimeType", file.type as ReviewFormValues["reviewImageMimeType"], {
      shouldValidate: true,
    });
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setValue("reviewImageBase64", "", { shouldValidate: true });
    setImagePreviewUrl(null);
  }

  async function onSubmit(values: ReviewFormValues) {
    setSubmitState("submitting");
    setSubmitError(null);

    try {
      const res = await fetch("/api/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!data.ok) {
        setSubmitState("error");
        setSubmitError(data.error ?? "제출 중 문제가 발생했어요. 다시 시도해주세요.");
        return;
      }

      setSubmitState("success");
    } catch {
      setSubmitState("error");
      setSubmitError("네트워크 연결을 확인하고 다시 시도해주세요.");
    }
  }

  if (submitState === "success") {
    return (
      <div className="card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/apply-character.png" alt="미북 캐릭터" className="cardCharacter" />
        <div className="cardBody">
          <div className="successIcon">✓</div>
          <h1 className="successTitle">리뷰 인증이 접수됐어요</h1>
          <p className="successDesc">
            입력해주신 정보를 확인한 후,
            <br />
            영업일 기준 5일 이내 me포인트 2,000P를 지급해드려요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/apply-character.png" alt="미북 캐릭터" className="cardCharacter" />
      <div className="cardBody">
        <h2 className="formCardHeading">리뷰 인증 접수</h2>
        <p className="formCardDesc">아래 정보를 정확히 입력해 주세요.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="field">
            <label className="label" htmlFor="name">
              성함 <span className="requiredMark">*</span>
            </label>
            <input id="name" type="text" placeholder="홍길동" className="input" {...register("name")} />
            {errors.name && <p className="errorText">{errors.name.message}</p>}
          </div>

          <div className="field">
            <label className="label" htmlFor="email">
              미북 계정 ID <span className="requiredMark">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@mebook.co.kr"
              className="input"
              {...register("email")}
            />
            <a href="https://drive.google.com/file/d/1uWGcD_N8o9ov-pRfszg6Q2VH2EDxFXbu/view?usp=sharing" target="_blank" rel="noreferrer" className="fieldHint">
              *미북스토어 가입 및 포인트 확인 방법 상세보기
            </a>
            {errors.email && <p className="errorText">{errors.email.message}</p>}
          </div>

          <div className="field">
            <label className="label" htmlFor="phone">
              전화번호 <span className="requiredMark">*</span>
            </label>
            <input id="phone" type="tel" placeholder="010-1234-5678" className="input" {...register("phone")} />
            {errors.phone && <p className="errorText">{errors.phone.message}</p>}
          </div>

          <div className="field">
            <label className="label">
              리뷰 캡처 <span className="requiredMark">*</span>
            </label>

            {!hasImage ? (
              <label className="dropzone" htmlFor="reviewImage">
                <span className="dropzoneIcon">⬆</span>
                <span className="dropzoneText">이미지 업로드</span>
                <span className="dropzoneHint">jpg · png · jpeg · 최대 10MB</span>
                <input
                  id="reviewImage"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="hiddenInput"
                />
              </label>
            ) : (
              <div className="previewBox">
                {imagePreviewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreviewUrl} alt="리뷰 캡처 미리보기" className="previewImg" />
                )}
                <button type="button" onClick={handleRemoveImage} className="removeBtn">
                  다시 선택
                </button>
              </div>
            )}

            {(imageFileError || errors.reviewImageBase64) && (
              <p className="errorText">{imageFileError ?? errors.reviewImageBase64?.message}</p>
            )}
          </div>

          <div className="agreeRow">
            <input
              id="agreePrivacy"
              type="checkbox"
              className="agreeCheckbox"
              {...register("agreePrivacy")}
            />
            <label htmlFor="agreePrivacy" className="agreeLabel">
              개인정보 수집 및 이용에 동의합니다. <span className="requiredMark">(필수)</span>
              <button
                type="button"
                className="agreeToggle"
                onClick={() => setShowAgreeDetail((v) => !v)}
              >
                내용보기 {showAgreeDetail ? "▲" : "▾"}
              </button>
            </label>
          </div>
          {showAgreeDetail && (
  <div className="agreeDetail">
    <p className="agreeDetailTitle">개인정보 수집 및 이용 동의 안내</p>
    <p>
      메가스터디교육㈜는 개인정보 보호법 제15조 제1항 제1호에 따라, 정보주체의 동의가
      필요합니다.
    </p>

    <p className="agreeDetailSection">[1] 개인정보 수집 및 이용 목적</p>
    <p>- 앱 리뷰 프로모션 참여자 대상 포인트 지급 및 기프티콘 발송 목적의 자료 활용</p>

    <p className="agreeDetailSection">[2] 수집 항목</p>
    <p>- 이름, 연락처, 미북스토어 계정 및 본 신청서 기재 항목 전체</p>

    <p className="agreeDetailSection">[3] 개인정보 보유 및 이용 기간</p>
    <p>
      - 수집된 개인정보는 앱 리뷰 프로모션 종료 후 1년간 보관되며, 이후 파기됩니다.
      <br />
      - 수집된 정보는 본 프로모의 운영과 관련된 용도로만 사용되며, 그 외의 목적으로는
      활용되지 않습니다.
    </p>

    <p className="agreeDetailSection">[4] 동의 거부 시 불이익</p>
    <p>
      - 개인정보 제공에 대한 동의를 거부할 수 있으나, 이 경우 경품 지급에 제한이 있을 수
      있습니다.
    </p>

    <p className="agreeDetailSection">[5] 유의사항</p>
    <p>제출한 구글폼 형태의 서류는 반환하지 않습니다.</p>
  </div>
)}
          {errors.agreePrivacy && <p className="errorText">{errors.agreePrivacy.message}</p>}

          {submitState === "error" && submitError && <p className="submitErrorBanner">{submitError}</p>}

          <button type="submit" className="submitBtn" disabled={!isValid || submitState === "submitting"}>
            {submitState === "submitting" ? "제출하는 중..." : "리뷰 인증 제출하기"}
          </button>
        </form>

        <div className="guideSection">
          <p className="guideHeading">안내사항</p>
          <ul className="guideList">
            {GUIDELINES.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}