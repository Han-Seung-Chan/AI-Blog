import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AppLayout } from "@/components/layouts/AppLayout";

export default function AdminPage() {
  return (
    <AppLayout adminOnly>
      <h1 className="mb-6 text-3xl font-bold">관리자 대시보드</h1>
      <AdminDashboard />
    </AppLayout>
  );
}
