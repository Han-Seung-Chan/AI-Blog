import { UserDashboard } from "@/app/user/UserDashboard";
import { AppLayout } from "@/components/layouts/AppLayout";

export default function DashboardPage() {
  return (
    <AppLayout>
      <h1 className="mb-6 text-3xl font-bold">내 블로그 작성 관리</h1>
      <UserDashboard />
    </AppLayout>
  );
}
