"use client";

// [임시 UI] 관리자 로그인 페이지
// 디자인은 다음 단계(관리자 페이지 UI 작업)에서 다시 다듭니다.
// 지금은 "로그인이 실제로 동작하는지" 확인하는 용도의 최소 기능만 있어요.

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
    <div style={{ padding: 40, maxWidth: 320 }}>
      <h1>관리자 로그인 (임시)</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }}
        />
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 8 }}>
          {loading ? "확인 중..." : "로그인"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
