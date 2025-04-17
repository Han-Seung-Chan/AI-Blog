"use client";

import { BookImage } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BlogLink } from "@/components/common/BlogLink";
import { BlogPostTable } from "@/components/common/BlogPostTable";
import { ViewContentButton } from "@/components/common/ViewContentButton";
import { ReserveBlogModal } from "@/components/dialog/ReserveBlogModal";
import { ViewImagesModal } from "@/components/dialog/ViewImagesModal";
import { Button } from "@/components/ui/button";
import { useAvailableBlogPosts } from "@/hooks/useAvailableBlogPosts";
import {
  getBlogPostImages,
  reserveBlogPost,
} from "@/services/blog/blog-service";
import { BlogPost, BlogTableColumn } from "@/types/blog";
import { BlogImage } from "@/types/image";

export function AvailableBlogPostList() {
  const router = useRouter();
  const { posts, isLoading, error } = useAvailableBlogPosts();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isReserveBlogModal, setIsReserveBlogModal] = useState<boolean>(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);
  const [isReserving, setIsReserving] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [postImages, setPostImages] = useState<BlogImage[]>([]);
  const [imageError, setImageError] = useState<string>("");
  const [reserveError, setReserveError] = useState<string>("");

  const handleImageManagement = async (post: BlogPost): Promise<void> => {
    setSelectedPost(post);
    setImageError("");
    setIsUploadingImage(true);

    try {
      const images = await getBlogPostImages(post.id);
      setPostImages(images);
    } catch (error) {
      console.error("이미지 목록 조회 오류:", error);
      setImageError("이미지를 불러오는 중 오류가 발생했습니다.");
      setPostImages([]);
    } finally {
      setIsUploadingImage(false);
      setIsImageDialogOpen(true);
    }
  };

  const handleReserve = async (): Promise<void> => {
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
      key: "images",
      title: "이미지",
      render: (post) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleImageManagement(post)}
          className="flex items-center"
        >
          <BookImage className="mr-1 h-4 w-4" />
          보기
        </Button>
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

      {/* 이미지 보기 모달 */}
      <ViewImagesModal
        isOpen={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        selectedPost={selectedPost}
        postImages={postImages}
        imageError={imageError}
        isLoading={isUploadingImage}
      />
    </div>
  );
}
