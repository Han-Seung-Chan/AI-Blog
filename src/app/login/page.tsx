import { LoginForm } from "@/components/authentication/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-center text-3xl font-bold">
        AI 블로그 관리 시스템
      </h1>

      <LoginForm />

      <p className="mt-4 text-center">
        계정이 없으신가요?{" "}
        <Link href="/register" className="text-primary hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
