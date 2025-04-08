"use client";

import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "./Navbar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export function AppLayout({
  children,
  requireAuth = true,
  adminOnly = false,
}: AppLayoutProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 인증이 필요한 페이지에서 비로그인 상태일 경우
    if (!isLoading && requireAuth && !user) {
      // router.push("/login");
    }

    // 관리자 전용 페이지에서 관리자가 아닌 경우
    if (!isLoading && adminOnly && !isAdmin) {
      // router.push("/dashboard");
    }
  }, [user, isAdmin, isLoading, requireAuth, adminOnly, router]);

  // 로딩 중이거나 리다이렉트 조건에 해당하는 경우 로딩 표시
  // if (isLoading || (requireAuth && !user) || (adminOnly && !isAdmin)) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <Loader2 className="text-primary h-8 w-8 animate-spin" />
  //     </div>
  //   );
  // }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
