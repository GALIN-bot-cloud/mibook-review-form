// [관리자 페이지] 수집된 리뷰 작성자 목록 조회/관리
// 접근 시 middleware.ts 에서 로그인 여부를 먼저 확인함 (비로그인 시 /admin/login 으로 이동)
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return <AdminDashboard />;
}