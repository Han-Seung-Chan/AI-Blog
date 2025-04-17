"use client";

import { FileEdit, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserBlogPostList } from "@/components/user/UserBlogPostList";
import {
  getAvailableBlogPosts,
  getMyAssignments,
} from "@/services/blog/blog-service";
import { UserPointsInfo } from "@/components/user/UserPointsInfo";

export function UserDashboard() {
  const [stats, setStats] = useState({
    available: 0,
    myReserved: 0,
    myCompleted: 0,
    myRejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // 사용 가능한 블로그 글 가져오기
      const availablePosts = await getAvailableBlogPosts();
      // 내 작업 목록 가져오기
      const myAssignments = await getMyAssignments();

      // 통계 계산
      setStats({
        available: availablePosts.length,
        myReserved: myAssignments.filter((post) => post.status === "reserved")
          .length,
        myCompleted: myAssignments.filter((post) => post.status === "completed")
          .length,
        myRejected: myAssignments.filter((post) => post.status === "rejected")
          .length,
      });
    } catch (error) {
      console.error("데이터 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
        <h2 className="text-xl font-semibold">내 작업 현황</h2>
        <Link href="/blog-posts">
          <Button className="flex items-center gap-2">
            <FileEdit className="h-4 w-4" />
            작성 가능한 글 목록 보기
          </Button>
        </Link>
      </div>

      {/* 포인트 정보 추가 */}
      <UserPointsInfo />

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              작성 가능한 글
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-500">
              {stats.available}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              내가 예약한 글
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">
              {stats.myReserved}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              작성 완료한 글
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              {stats.myCompleted}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">거절된 글</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {stats.myRejected}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 내 블로그 글 목록 */}
      <UserBlogPostList onStatusChange={fetchData} />
    </div>
  );
}
