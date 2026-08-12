import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "미북 리뷰 이벤트 참여 신청",
  description: "미북 앱 리뷰 작성자 대상 포인트 지급 신청 페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Pretendard 가변 폰트: 본문/설명용 */}
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
        {/* Black Han Sans: Hero 메인 타이틀 전용 (두껍고 임팩트 있는 프로모션 서체) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}