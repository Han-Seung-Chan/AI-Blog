"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  console.log(user);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // 로그인 상태면 역할에 따라 리다이렉트
        if (isAdmin) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        // 로그인 페이지로 리다이렉트
        router.push("/login");
      }
    }
  }, [user, isAdmin, isLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
    </div>
  );
}
