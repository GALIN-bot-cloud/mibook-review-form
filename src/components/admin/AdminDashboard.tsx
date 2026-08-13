"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { MonthSummary, PaymentStatus, ReviewRecord } from "@/types/review";
import ReviewDetailModal from "./ReviewDetailModal";

type TabKey = "requests" | "completed" | "rejected" | "log";

const TABS: { key: TabKey; label: string }[] = [
  { key: "requests", label: "리뷰 접수 관리" },
  { key: "completed", label: "지급 완료 내역" },
  { key: "rejected", label: "반려 내역" },
  { key: "log", label: "관리자 로그" },
];

const STATUS_FILTERS: { key: "전체" | PaymentStatus; label: string }[] = [
  { key: "전체", label: "전체" },
  { key: "접수", label: "접수" },
  { key: "검토중", label: "검토중" },
  { key: "지급완료", label: "지급완료" },
  { key: "반려", label: "반려" },
];

function getCurrentMonthKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("requests");
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"전체" | PaymentStatus>("전체");

  const [selectedRecord, setSelectedRecord] = useState<ReviewRecord | null>(null);
  const [pendingStatus, setPendingStatus] = useState<PaymentStatus>("접수");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) loadRecords(selectedMonth);
  }, [selectedMonth]);

  // 탭을 바꾸면 그에 맞는 상태 필터를 자동으로 맞춰줌
  useEffect(() => {
    if (activeTab === "completed") setStatusFilter("지급완료");
    else if (activeTab === "rejected") setStatusFilter("반려");
    else if (activeTab === "requests") setStatusFilter("전체");
  }, [activeTab]);

  async function loadMonths() {
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.ok && data.months) {
        setMonths(data.months);
        if (data.months.length > 0 && !data.months.some((m: MonthSummary) => m.month === selectedMonth)) {
          setSelectedMonth(data.months[0].month);
        }
      }
    } catch {
      // 조용히 무시 (월 목록은 보조 정보라 실패해도 페이지는 계속 동작)
    }
  }

  async function loadRecords(month: string) {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/reviews?month=${encodeURIComponent(month)}`);
      const data = await res.json();
      if (data.ok) {
        setRecords(data.records ?? []);
      } else {
        setLoadError(data.error ?? "목록을 불러오지 못했어요.");
      }
    } catch {
      setLoadError("네트워크 오류로 목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter !== "전체" && r.status !== statusFilter) return false;
      if (nameFilter && !r.name.includes(nameFilter)) return false;
      if (emailFilter && !r.email.toLowerCase().includes(emailFilter.toLowerCase())) return false;
      if (phoneFilter && !r.phone.includes(phoneFilter)) return false;
      return true;
    });
  }, [records, statusFilter, nameFilter, emailFilter, phoneFilter]);

  const summary = useMemo(() => {
    const total = records.length;
    const received = records.filter((r) => r.status === "접수").length;
    const reviewing = records.filter((r) => r.status === "검토중").length;
    const completed = records.filter((r) => r.status === "지급완료").length;
    const rejected = records.filter((r) => r.status === "반려").length;
    return { total, received, reviewing, completed, rejected };
  }, [records]);

  function handleResetFilters() {
    setNameFilter("");
    setEmailFilter("");
    setPhoneFilter("");
    setStatusFilter("전체");
  }

  function handleOpenDetail(record: ReviewRecord) {
    setSelectedRecord(record);
    setPendingStatus(record.status);
  }

  async function handleSaveStatus(newStatus: PaymentStatus) {
    if (!selectedRecord) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedRecord.submissionId,
          month: selectedMonth,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setRecords((prev) =>
          prev.map((r) =>
            r.submissionId === selectedRecord.submissionId ? { ...r, status: newStatus } : r
          )
        );
        setSelectedRecord(null);
      } else {
        alert(data.error ?? "상태 변경에 실패했어요.");
      }
    } catch {
      alert("네트워크 오류로 상태 변경에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  function handleExportExcel() {
    const header = ["접수번호", "접수일", "이름", "이메일", "전화번호", "리뷰캡처링크", "상태", "지급처리일시"];
    const rows = filteredRecords.map((r) => [
      r.submissionId,
      r.submittedAt,
      r.name,
      r.email,
      r.phone,
      r.reviewImageUrl,
      r.status,
      r.paidAt ?? "",
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `리뷰접수목록_${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="adminPage">
      <header className="adminHeader">
        <div className="adminLogoRow">
          <span className="adminLogo">📖</span>
          <div>
            <p className="adminLogoTitle">Mebook 리뷰 이벤트</p>
            <p className="adminLogoSub">독자 리뷰 작성 1,000 me포인트 즉시 지급 완료</p>
          </div>
        </div>
        <div className="adminHeaderRight">
          <Link href="/" className="adminNavLink">
            사용자 페이지
          </Link>
          <span className="adminNavLink isActive">관리자 페이지</span>
          <span className="adminBadgeCount">접수: {summary.total}건</span>
          <button type="button" className="adminLogoutBtn" onClick={handleLogout}>
            LOG OUT
          </button>
        </div>
      </header>

      <nav className="adminTabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`adminTab ${activeTab === tab.key ? "isActive" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="adminSummaryRow">
        <div className="adminSummaryCard">
          <p className="adminSummaryLabel">TOTAL REQUESTS</p>
          <p className="adminSummaryValue">{summary.total}건</p>
          <p className="adminSummarySub">전체 접수건 수</p>
        </div>
        <div className="adminSummaryCard">
          <p className="adminSummaryLabel">COMPLETED</p>
          <p className="adminSummaryValue adminSummaryValue-success">{summary.completed}건</p>
          <p className="adminSummarySub">지급액: {(summary.completed * 1000).toLocaleString()} meP</p>
        </div>
        <div className="adminSummaryCard">
          <p className="adminSummaryLabel">IN REVIEW</p>
          <p className="adminSummaryValue adminSummaryValue-warning">{summary.reviewing}건</p>
          <p className="adminSummarySub">검수 대기중</p>
        </div>
        <div className="adminSummaryCard">
          <p className="adminSummaryLabel">REJECTED</p>
          <p className="adminSummaryValue adminSummaryValue-error">{summary.rejected}건</p>
          <p className="adminSummarySub">정보 미확인/반려</p>
        </div>
      </section>
      
      {activeTab === "log" ? (
        <section className="adminEmptyNotice">
          관리자 로그 기능은 추후 업데이트될 예정입니다.
        </section>
      ) : (
        <>
          <section className="adminFilterBar">
            <div className="adminFilterRow">
              <div className="adminFilterField">
                <label className="adminFilterLabel">접수월</label>
                <select
                  className="adminFilterInput"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.length === 0 && <option value={selectedMonth}>{selectedMonth}</option>}
                  {months.map((m) => (
                    <option key={m.month} value={m.month}>
                      {m.month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="adminFilterField">
                <label className="adminFilterLabel">이름</label>
                <input
                  className="adminFilterInput"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="이름 입력"
                />
              </div>
              <div className="adminFilterField">
                <label className="adminFilterLabel">이메일</label>
                <input
                  className="adminFilterInput"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  placeholder="이메일 입력"
                />
              </div>
              <div className="adminFilterField">
                <label className="adminFilterLabel">전화번호</label>
                <input
                  className="adminFilterInput"
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                  placeholder="전화번호 입력"
                />
              </div>
            </div>

            <div className="adminFilterRow adminFilterRowBottom">
              <div className="adminStatusFilterRow">
                <span className="adminFilterLabel">상태 필터:</span>
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className={`adminStatusFilterBtn ${statusFilter === f.key ? "isActive" : ""}`}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="adminFilterActions">
                <button type="button" className="adminBtnGhost" onClick={handleResetFilters}>
                  ↺ 초기화
                </button>
                <button type="button" className="adminBtnPrimary" onClick={handleExportExcel}>
                  ⬇ 엑셀 내보내기 (.xlsx)
                </button>
              </div>
            </div>
          </section>

          <section className="adminTableSection">
            <div className="adminTableHeader">
              <p>리뷰 접수 목록 ({filteredRecords.length}건)</p>
            </div>

            {loading ? (
              <p className="adminTableStatusMsg">불러오는 중...</p>
            ) : loadError ? (
              <p className="adminTableStatusMsg adminTableStatusMsg-error">{loadError}</p>
            ) : filteredRecords.length === 0 ? (
              <p className="adminTableStatusMsg">조건에 맞는 신청 내역이 없어요.</p>
            ) : (
              <div className="adminTableWrap">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>NO.</th>
                      <th>접수번호</th>
                      <th>접수일</th>
                      <th>이름</th>
                      <th>이메일</th>
                      <th>전화번호</th>
                      <th>리뷰 캡처</th>
                      <th>상태</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r, i) => (
                      <tr key={r.submissionId}>
                        <td>{i + 1}</td>
                        <td>{r.submissionId}</td>
                        <td>{r.submittedAt}</td>
                        <td>{r.name}</td>
                        <td>{r.email}</td>
                        <td>{r.phone}</td>
                        <td>
                          <a href={r.reviewImageUrl} target="_blank" rel="noreferrer" className="adminTableLink">
                            👁 보기
                          </a>
                        </td>
                        <td>
                          <span className={`adminStatusBadge adminStatusBadge-${r.status}`}>{r.status}</span>
                        </td>
                        <td>
                          <button type="button" className="adminDetailBtn" onClick={() => handleOpenDetail(r)}>
                            📝 상세
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {selectedRecord && (
        <ReviewDetailModal
          record={selectedRecord}
          month={selectedMonth}
          onClose={() => setSelectedRecord(null)}
          onSave={handleSaveStatus}
          pendingStatus={pendingStatus}
          onChangePendingStatus={setPendingStatus}
          saving={saving}
        />
      )}
    </div>
  );
}