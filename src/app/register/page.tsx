import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-center text-3xl font-bold">
        AI 블로그 관리 시스템
      </h1>

      <RegisterForm />

      <p className="mt-4 text-center">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-primary hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
