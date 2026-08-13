"use client";

// [관리자 로그인 페이지] 화면 정중앙에 팝업 카드 형태로 배치

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();

    setLoading(false);

    if (data.ok) {
      router.push("/admin");
    } else {
      setError(data.error ?? "로그인에 실패했습니다.");
    }
  }

  return (
    <div className="adminLoginBg">
      <div className="adminLoginCard">
        <div className="adminLoginLogo">📖</div>
        <h1 className="adminLoginTitle">Mebook 관리자</h1>
        <p className="adminLoginSubtitle">리뷰 이벤트 관리 페이지에 접속하려면 비밀번호를 입력해주세요.</p>

        <form onSubmit={handleSubmit} className="adminLoginForm">
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="adminLoginInput"
            autoFocus
          />
          <button type="submit" disabled={loading} className="adminLoginBtn">
            {loading ? "확인 중..." : "로그인"}
          </button>
          {error && <p className="adminLoginError">{error}</p>}
        </form>
      </div>
    </div>
  );
}