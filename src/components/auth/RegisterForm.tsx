"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [blogId, setBlogId] = useState("");
  const [phone, setPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");
  const { register, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 일반 사용자 회원가입인 경우 추가 정보 포함
    if (activeTab === "user") {
      await register({
        email,
        password,
        name,
        role: "user" as const,
        blogId,
        phone,
        bankName,
        accountNumber,
      });
    } else {
      await register({
        email,
        password,
        name,
        role: "admin" as const,
      });
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>회원가입</CardTitle>

        {/* 탭 버튼 */}
        <div className="mt-4 flex border-b">
          <button
            className={`w-full px-4 pb-2 ${
              activeTab === "user"
                ? "border-primary border-b-2 font-medium"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("user")}
            type="button"
          >
            일반 사용자
          </button>
          {/* <button
            className={`w-full px-4 pb-2 ${
              activeTab === "admin"
                ? "border-primary border-b-2 font-medium"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("admin")}
            type="button"
          >
            관리자
          </button> */}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 입력"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 입력"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
            />
          </div>

          {/* 일반 사용자 탭에서만 표시되는 추가 필드 */}
          {activeTab === "user" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="blogId">블로그 ID</Label>
                <Input
                  id="blogId"
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                  placeholder="블로그 URL 입력"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="연락처 입력"
                  required
                />
              </div>

              <div className="mt-6 border-t pt-4">
                <h3 className="mb-3 text-sm font-medium">정산을 위한 정보</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">은행명</Label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="은행명 입력"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">계좌번호</Label>
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="계좌번호 입력('-' 없이)"
                  required
                />
              </div>
            </>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                가입 중...
              </>
            ) : (
              "회원가입"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
