"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BlogLink } from "@/components/common/BlogLink";
import { BlogPostTable } from "@/components/common/BlogPostTable";
import { ViewContentButton } from "@/components/common/ViewContentButton";
import { ReserveBlogModal } from "@/components/dialog/ReserveBlogModal";
import { Button } from "@/components/ui/button";
import { useAvailableBlogPosts } from "@/hooks/useAvailableBlogPosts";
import { reserveBlogPost } from "@/services/blog/blog-service";
import { BlogPost, BlogTableColumn } from "@/types/blog";

export function AvailableBlogPostList() {
  const router = useRouter();
  const { posts, isLoading, error } = useAvailableBlogPosts();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isReserveBlogModal, setIsReserveBlogModal] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [reserveError, setReserveError] = useState("");

  const handleReserve = async () => {
    if (!selectedPost) return;

    try {
      setIsReserving(true);
      await reserveBlogPost(selectedPost.id);

      // 예약 성공 시 내 대시보드로 이동
      router.push("/dashboard");
    } catch (error) {
      console.error("블로그 글 예약 오류:", error);
      setReserveError("예약 처리 중 오류가 발생했습니다.");
      setIsReserving(false);
    }
  };

  const columns: BlogTableColumn[] = [
    { key: "store_name", title: "매장명" },
    { key: "main_keyword", title: "키워드" },
    {
      key: "ai_content",
      title: "블로그 글",
      render: (post) => (
        <ViewContentButton
          content={post.ai_content || ""}
          title="블로그 컨텐츠"
        />
      ),
    },
    {
      key: "store_url",
      title: "매장 링크",
      render: (post) => <BlogLink url={post.store_url} label="매장 정보" />,
    },
    {
      key: "actions",
      title: "작업",
      render: (post) => (
        <Button
          size="sm"
          onClick={() => {
            setSelectedPost(post);
            setReserveError("");
            setIsReserveBlogModal(true);
          }}
        >
          작성 예약
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">작성 가능한 블로그 글 목록</h2>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          내 대시보드로 돌아가기
        </Button>
      </div>

      {error && <p className="text-destructive">{error}</p>}

      <BlogPostTable
        posts={posts}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="작성 가능한 블로그 글이 없습니다"
      />

      {/* 예약 확인 대화 상자 */}
      <ReserveBlogModal
        isOpen={isReserveBlogModal}
        onOpenChange={setIsReserveBlogModal}
        selectedPost={selectedPost}
        onReserve={handleReserve}
        isReserving={isReserving}
        error={reserveError}
      />
    </div>
  );
}
