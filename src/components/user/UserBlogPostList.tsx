"use client";

import { BookImage } from "lucide-react";
import { useState } from "react";

import { BlogLink } from "@/components/common/BlogLink";
import { BlogPostTable } from "@/components/common/BlogPostTable";
import { BlogStatusBadge } from "@/components/common/BlogStatusBadge";
import { ViewContentButton } from "@/components/common/ViewContentButton";
import { CompleteBlogModal } from "@/components/dialog/CompleteBlogModal";
import { ResubmitBlogModal } from "@/components/dialog/ResubmitBlogModal";
import { ViewImagesModal } from "@/components/dialog/ViewImagesModal";
import { Button } from "@/components/ui/button";
import { useUserBlogPosts } from "@/hooks/useUserBlogPosts";
import {
  completeBlogPost,
  getBlogPostImages,
  resubmitBlogPost,
} from "@/services/blog/blog-service";
import { BlogPost, BlogTableColumn } from "@/types/blog";
import { BlogImage } from "@/types/image";

interface UserBlogPostListProps {
  onStatusChange?: () => void;
}

export function UserBlogPostList({ onStatusChange }: UserBlogPostListProps) {
  const { posts, isLoading, refreshPosts } = useUserBlogPosts();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isCompleteBlogModal, setIsCompleteBlogModal] =
    useState<boolean>(false);
  const [isResubmitBlogModal, setIsResubmitBlogModal] =
    useState<boolean>(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);

  const [blogUrl, setBlogUrl] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [postImages, setPostImages] = useState<BlogImage[]>([]);
  const [isResubmitting, setIsResubmitting] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");

  const handleComplete = async (): Promise<void> => {
    if (!selectedPost) return;

    // URL 유효성 검증
    if (!blogUrl.trim()) {
      setUrlError("블로그 URL은 필수 항목입니다.");
      return;
    }

    if (!blogUrl.startsWith("http://") && !blogUrl.startsWith("https://")) {
      setUrlError(
        "유효한 URL 형식이 아닙니다. http:// 또는 https://로 시작해야 합니다.",
      );
      return;
    }

    setUrlError("");

    try {
      setIsCompleting(true);
      await completeBlogPost(selectedPost.id, blogUrl, notes);

      // 목록 새로고침 및 부모 컴포넌트에 알림
      await refreshPosts();
      if (onStatusChange) onStatusChange();

      setIsCompleteBlogModal(false);
    } catch (error) {
      console.error("블로그 글 완료 처리 오류:", error);
      if (error.response?.status === 429) {
        setUrlError(
          "오늘 작업 가능한 횟수를 모두 사용했습니다. 내일 다시 시도해주세요.",
        );
      } else {
        setUrlError("완료 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const handleResubmit = async (
    blogUrl: string,
    notes: string,
  ): Promise<void> => {
    if (!selectedPost) return;

    try {
      setIsResubmitting(true);
      await resubmitBlogPost(selectedPost.id, blogUrl, notes);
      await refreshPosts();
      if (onStatusChange) onStatusChange();
      setIsResubmitBlogModal(false);
    } catch (error) {
      console.error("블로그 글 재제출 오류:", error);
    } finally {
      setIsResubmitting(false);
    }
  };

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
      key: "status",
      title: "상태",
      render: (post) => (
        <BlogStatusBadge status={post.status} userType="user" />
      ),
    },
    {
      key: "blog_url",
      title: "블로그 링크",
      render: (post) => <BlogLink url={post.blog_url} />,
    },
    {
      key: "actions",
      title: "작업",
      render: (post) => {
        if (post.status === "reserved") {
          return (
            <Button
              size="sm"
              onClick={() => {
                setSelectedPost(post);
                setBlogUrl("");
                setNotes("");
                setUrlError("");
                setIsCompleteBlogModal(true);
              }}
            >
              완료하기
            </Button>
          );
        }

        if (post.status === "completed") {
          return (
            <span className="text-muted-foreground text-sm">검수 대기 중</span>
          );
        }

        if (post.status === "rejected") {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedPost(post);
                setBlogUrl(post.blog_url || "");
                setNotes("");
                setUrlError("");
                setIsResubmitBlogModal(true);
              }}
            >
              수정 후 재제출
            </Button>
          );
        }

        if (post.status === "approved") {
          return <span className="text-sm text-green-500">승인됨</span>;
        }

        return "-";
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">내 블로그 글 목록</h2>

      <BlogPostTable
        posts={posts}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="예약된 블로그 글이 없습니다"
      />

      {/* 완료 대화 상자 */}
      <CompleteBlogModal
        isOpen={isCompleteBlogModal}
        onOpenChange={setIsCompleteBlogModal}
        selectedPost={selectedPost}
        onComplete={handleComplete}
        isCompleting={isCompleting}
        blogUrl={blogUrl}
        setBlogUrl={setBlogUrl}
        notes={notes}
        setNotes={setNotes}
        urlError={urlError}
      />

      {/* 재제출 대화 상자 */}
      <ResubmitBlogModal
        isOpen={isResubmitBlogModal}
        onOpenChange={setIsResubmitBlogModal}
        selectedPost={selectedPost}
        onResubmit={handleResubmit}
        isResubmitting={isResubmitting}
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
