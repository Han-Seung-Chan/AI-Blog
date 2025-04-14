"use client";

import {
  AlertCircle,
  Calendar,
  Check,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ApproveBlogModal } from "@/components/dialog/ApproveBlogModal";
import { ManageImagesModal } from "@/components/dialog/ManageImagesModal";
import { ViewResultModal } from "@/components/dialog/ViewResultModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/date";
import {
  approveBlogPost,
  deleteBlogPostImage,
  getMyBlogPosts,
  uploadBlogPostImages,
} from "@/services/admin/admin-service";

export function AdminBlogPostList() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isApproveBlogModal, setIsApproveBlogModal] = useState(false);
  const [isViewResultModal, setIsViewResultModal] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedAiContent, setSelectedAiContent] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [postImages, setPostImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getMyBlogPosts();
      setPosts(data);
    } catch (error) {
      console.error("블로그 글 목록 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const handleApprove = async () => {
    if (!selectedPost) return;

    try {
      setIsApproving(true);
      await approveBlogPost(selectedPost.id, feedback);
      await fetchBlogPosts();
      setIsApproveBlogModal(false);
    } catch (error) {
      console.error("블로그 글 승인 오류:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleViewAiContent = (post) => {
    setSelectedAiContent(post.ai_content || "AI 콘텐츠가 없습니다.");
    setIsViewResultModal(true);
  };

  const handleImageManagement = (post) => {
    setSelectedPost(post);
    // 게시물에 연결된 이미지 목록 가져오기
    setPostImages(post.images || []);
    setImageError("");
    setIsImageDialogOpen(true);
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
      setPostImages((prev) => [...prev, ...uploadedImages]);

      // 블로그 글 목록 다시 가져오기
      await fetchBlogPosts();
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      setImageError("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = null; // 파일 입력 초기화
      }
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteBlogPostImage(selectedPost.id, imageId);

      // 이미지 목록에서 삭제된 이미지 제거
      setPostImages((prev) => prev.filter((img) => img.id !== imageId));

      // 블로그 글 목록 다시 가져오기
      await fetchBlogPosts();
    } catch (error) {
      console.error("이미지 삭제 오류:", error);
      setImageError("이미지 삭제 중 오류가 발생했습니다.");
    }
  };

  // 상태에 따른 색상 클래스
  const getStatusClass = (status) => {
    switch (status) {
      case "created":
        return "text-blue-500";
      case "reserved":
        return "text-yellow-500";
      case "completed":
        return "text-orange-500";
      case "approved":
        return "text-green-500";
      default:
        return "";
    }
  };

  // 상태 텍스트
  const getStatusText = (status) => {
    switch (status) {
      case "created":
        return "미예약";
      case "reserved":
        return "예약됨";
      case "completed":
        return "완료 대기";
      case "approved":
        return "승인됨";
      default:
        return status;
    }
  };

  // 날짜별로 그룹화하는 함수
  const groupPostsByDate = () => {
    const grouped = {};

    posts.forEach((post) => {
      const dateKey = formatDate(post.created_at);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(post);
    });

    // 날짜를 최근 순으로 정렬
    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((date) => ({
        date,
        posts: grouped[date],
      }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const groupedPosts = groupPostsByDate();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">블로그 글 목록</h2>

      {groupedPosts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>표시할 블로그 글이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        groupedPosts.map((group) => (
          <div key={group.date} className="space-y-2">
            <h3 className="text-lg font-medium">{group.date}</h3>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left">매장명</th>
                        <th className="px-4 py-3 text-left">키워드</th>
                        <th className="px-4 py-3 text-left">AI 컨텐츠</th>
                        <th className="px-4 py-3 text-left">이미지 등록</th>
                        <th className="px-4 py-3 text-left">상태</th>
                        <th className="px-4 py-3 text-left">담당자</th>
                        <th className="px-4 py-3 text-left">블로그 링크</th>

                        <th className="px-4 py-3 text-left">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.posts.map((post) => (
                        <tr key={post.id} className="border-t">
                          <td className="px-4 py-3">{post.store_name}</td>
                          <td className="px-4 py-3">{post.main_keyword}</td>
                          <td className="px-4 py-3">
                            {post.ai_content ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewAiContent(post)}
                                className="flex items-center"
                              >
                                <FileText className="mr-1 h-4 w-4" />
                                보기
                              </Button>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleImageManagement(post)}
                              className="flex items-center"
                            >
                              <ImageIcon className="mr-1 h-4 w-4" />
                              {post.images && post.images.length > 0
                                ? `관리 (${post.images.length}/5)`
                                : "등록"}
                            </Button>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`flex items-center ${getStatusClass(post.status)}`}
                            >
                              {post.status === "created" && (
                                <AlertCircle className="mr-1 h-4 w-4" />
                              )}
                              {post.status === "reserved" && (
                                <User className="mr-1 h-4 w-4" />
                              )}
                              {post.status === "completed" && (
                                <Calendar className="mr-1 h-4 w-4" />
                              )}
                              {post.status === "approved" && (
                                <Check className="mr-1 h-4 w-4" />
                              )}
                              {getStatusText(post.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {post.assigned_to
                              ? post.assigned_user?.name || "할당됨"
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {post.blog_url ? (
                              <a
                                href={post.blog_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary flex items-center hover:underline"
                              >
                                링크 <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {post.status === "completed" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPost(post);
                                  setFeedback("");
                                  setIsApproveBlogModal(true);
                                }}
                                // 이미지가 없는 경우 승인 버튼 비활성화
                                disabled={
                                  !post.images || post.images.length === 0
                                }
                                title={
                                  !post.images || post.images.length === 0
                                    ? "이미지가 등록되어야 승인할 수 있습니다"
                                    : ""
                                }
                              >
                                승인하기
                              </Button>
                            )}
                            {post.status === "completed" &&
                              (!post.images || post.images.length === 0) && (
                                <div className="mt-1 text-xs text-red-500">
                                  이미지 필요
                                </div>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ))
      )}

      {/* 승인 대화 상자 */}
      <ApproveBlogModal
        isOpen={isApproveBlogModal}
        onOpenChange={setIsApproveBlogModal}
        selectedPost={selectedPost}
        onApprove={handleApprove}
        isApproving={isApproving}
      />

      {/* AI 컨텐츠 대화 상자 */}
      <ViewResultModal
        isOpen={isViewResultModal}
        onOpenChange={setIsViewResultModal}
        title="블로그 컨텐츠"
        content={selectedAiContent}
      />

      {/* 이미지 관리 대화 상자 */}
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
