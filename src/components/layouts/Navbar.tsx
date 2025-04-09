"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="bg-background border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            AI 블로그 관리
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium hover:underline"
                >
                  관리자 대시보드
                </Link>
              )}
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:underline"
              >
                블로그 글 관리
              </Link>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="mr-1 h-4 w-4" />
                  로그아웃
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-x-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">회원가입</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
