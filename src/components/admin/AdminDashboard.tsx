"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getAllBlogPosts } from "@/services/supabase";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { AdminBlogPostList } from "@/components/admin/AdminBlogPostList";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    created: 0,
    reserved: 0,
    completed: 0,
    approved: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const posts = await getAllBlogPosts();

        // 통계 계산
        const newStats = {
          total: posts.length,
          created: posts.filter((post) => post.status === "created").length,
          reserved: posts.filter((post) => post.status === "reserved").length,
          completed: posts.filter((post) => post.status === "completed").length,
          approved: posts.filter((post) => post.status === "approved").length,
        };

        setStats(newStats);
      } catch (error) {
        console.error("블로그 글 목록 조회 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">블로그 글 현황</h2>
        <Link href="/admin/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />새 블로그 글 생성
          </Button>
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">미예약</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-500">{stats.created}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">예약됨</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">
              {stats.reserved}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">완료 대기</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-500">
              {stats.completed}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">승인됨</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              {stats.approved}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 블로그 글 목록 */}
      <AdminBlogPostList />
    </div>
  );
}
