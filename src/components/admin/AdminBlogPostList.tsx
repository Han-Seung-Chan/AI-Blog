"use client";

import { BookImage, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { BlogLink } from "@/components/common/BlogLink";
import { BlogPostTable } from "@/components/common/BlogPostTable";
import { BlogStatusBadge } from "@/components/common/BlogStatusBadge";
import { ViewContentButton } from "@/components/common/ViewContentButton";
import { ApproveBlogModal } from "@/components/dialog/ApproveBlogModal";
import { ManageImagesModal } from "@/components/dialog/ManageImagesModal";
import { RejectBlogModal } from "@/components/dialog/RejectBlogModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminBlogPosts } from "@/hooks/useAdminBlogPosts";
import { groupPostsByDate } from "@/lib/date";
import {
  approveBlogPost,
  deleteBlogPostImage,
  getBlogPostImages,
  rejectBlogPost,
  uploadBlogPostImages,
} from "@/services/admin/admin-service";
import { BlogPost, BlogTableColumn } from "@/types/blog";

export function AdminBlogPostList() {
  const { posts, isLoading, refreshPosts } = useAdminBlogPosts();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isApproveBlogModal, setIsApproveBlogModal] = useState(false);
  const [isRejectBlogModal, setIsRejectBlogModal] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [postImages, setPostImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const handleApprove = async (feedback: string) => {
    if (!selectedPost) return;

    try {
      setIsApproving(true);
      await approveBlogPost(selectedPost.id, feedback);
      await refreshPosts();
      setIsApproveBlogModal(false);
    } catch (error) {
      console.error("블로그 글 승인 오류:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (rejectionReason: string) => {
    if (!selectedPost) return;

    try {
      setIsRejecting(true);
      await rejectBlogPost(selectedPost.id, rejectionReason);
      await refreshPosts();
      setIsRejectBlogModal(false);
    } catch (error) {
      console.error("블로그 글 거절 오류:", error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleImageManagement = async (post: BlogPost) => {
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // 파일 유효성 검사
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/"),
    );
    if (invalidFiles.length > 0) {
      setImageError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 최대 5개 이미지 제한 확인
    const totalImages = postImages.length + files.length;
    if (totalImages > 5) {
      setImageError("이미지는 최대 5개까지만 등록 가능합니다.");
      return;
    }

    setIsUploadingImage(true);
    setImageError("");

    try {
      // 파일 업로드 처리
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const uploadedImages = await uploadBlogPostImages(
        selectedPost.id,
        formData,
      );

      // 업로드 성공 시 이미지 목록 업데이트
      setPostImages((prev) => [...uploadedImages, ...prev]);

      await refreshPosts();
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      setImageError("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteBlogPostImage(selectedPost.id, imageId);
      setPostImages((prev) => prev.filter((img) => img.id !== imageId));
      await refreshPosts();
    } catch (error) {
      console.error("이미지 삭제 오류:", error);
      setImageError("이미지 삭제 중 오류가 발생했습니다.");
    }
  };

  const columns: BlogTableColumn[] = [
    { key: "store_name", title: "매장명" },
    { key: "main_keyword", title: "키워드" },
    {
      key: "ai_content",
      title: "AI 컨텐츠",
      render: (post) => (
        <ViewContentButton
          content={post.ai_content || ""}
          title="블로그 컨텐츠"
        />
      ),
    },
    {
      key: "images",
      title: "이미지 등록",
      render: (post) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleImageManagement(post)}
          className="flex items-center"
        >
          <BookImage className="mr-1 h-4 w-4" />
          {post.has_images ? "관리" : "등록"}
        </Button>
      ),
    },
    {
      key: "status",
      title: "상태",
      render: (post) => (
        <BlogStatusBadge status={post.status} userType="admin" />
      ),
    },
    {
      key: "assigned_to",
      title: "담당자",
      render: (post) =>
        post.assigned_to ? post.assigned_user?.name || "할당됨" : "-",
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
        if (post.status === "completed") {
          return (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => {
                  setSelectedPost(post);
                  setIsApproveBlogModal(true);
                }}
              >
                승인하기
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setSelectedPost(post);
                  setIsRejectBlogModal(true);
                }}
              >
                거절하기
              </Button>
            </div>
          );
        }
        return null;
      },
    },
  ];

  const groupedPosts = groupPostsByDate(posts);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">블로그 글 목록</h2>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : groupedPosts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>표시할 블로그 글이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        groupedPosts.map((group) => (
          <div key={group.date} className="space-y-2">
            <h3 className="text-lg font-medium">{group.date}</h3>
            <BlogPostTable
              posts={group.posts}
              columns={columns}
              isLoading={false}
              emptyMessage=""
            />
          </div>
        ))
      )}

      {/* 모달 대화상자들 */}
      <ApproveBlogModal
        isOpen={isApproveBlogModal}
        onOpenChange={setIsApproveBlogModal}
        selectedPost={selectedPost}
        onApprove={handleApprove}
        isApproving={isApproving}
      />

      <RejectBlogModal
        isOpen={isRejectBlogModal}
        onOpenChange={setIsRejectBlogModal}
        selectedPost={selectedPost}
        onReject={handleReject}
        isRejecting={isRejecting}
      />

      <ManageImagesModal
        isOpen={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        selectedPost={selectedPost}
        postImages={postImages}
        isUploadingImage={isUploadingImage}
        imageError={imageError}
        onFileSelect={handleFileSelect}
        onDeleteImage={handleDeleteImage}
      />
    </div>
  );
}
