"use client";

import {
  AlertCircle,
  Calendar,
  Check,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  approveBlogPost,
  getMyBlogPosts,
  uploadBlogPostImages,
  deleteBlogPostImage,
} from "@/services/admin/admin-service";
import { formatDate } from "@/lib/date";

export function AdminBlogPostList() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAiContentDialogOpen, setIsAiContentDialogOpen] = useState(false);
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
      setIsDialogOpen(false);
    } catch (error) {
      console.error("블로그 글 승인 오류:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleViewAiContent = (post) => {
    setSelectedAiContent(post.ai_content || "AI 콘텐츠가 없습니다.");
    setIsAiContentDialogOpen(true);
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
                                  setIsDialogOpen(true);
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>블로그 글 승인</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <h3 className="mb-2 font-medium">{selectedPost?.store_name}</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              작성자: {selectedPost?.assigned_user?.name || "알 수 없음"}
            </p>

            {selectedPost?.blog_url && (
              <div className="mb-4">
                <a
                  href={selectedPost.blog_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary flex items-center hover:underline"
                >
                  블로그 글 확인하기 <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">피드백 (선택사항)</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="작성자에게 전달할 피드백을 입력하세요"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleApprove} disabled={isApproving}>
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "승인 완료"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI 컨텐츠 대화 상자 */}
      <Dialog
        open={isAiContentDialogOpen}
        onOpenChange={setIsAiContentDialogOpen}
      >
        <DialogContent className="w-[90vw] max-w-3xl p-4">
          <DialogHeader>
            <DialogTitle>AI 생성 컨텐츠</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
            <p className="text-base leading-relaxed break-words whitespace-pre-line">
              {selectedAiContent}
            </p>
          </div>
          <DialogFooter className="pt-4">
            <Button onClick={() => setIsAiContentDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 이미지 관리 대화 상자 */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="w-[90vw] max-w-3xl p-4">
          <DialogHeader>
            <DialogTitle>이미지 관리</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <h3 className="mb-2 font-medium">{selectedPost?.store_name}</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              등록된 이미지: {postImages.length}/5
            </p>

            {/* 이미지 업로드 영역 */}
            <div className="mb-6">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploadingImage || postImages.length >= 5}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage || postImages.length >= 5}
                className="flex h-20 w-full flex-col items-center justify-center border-dashed"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="mb-2 h-6 w-6 animate-spin" />
                    <span>업로드 중...</span>
                  </>
                ) : (
                  <>
                    <Plus className="mb-2 h-6 w-6" />
                    <span>
                      이미지 추가하기 {postImages.length >= 5 && "(최대 5개)"}
                    </span>
                  </>
                )}
              </Button>

              {imageError && (
                <p className="mt-2 text-sm text-red-500">{imageError}</p>
              )}
            </div>

            {/* 이미지 목록 */}
            {postImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {postImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-md border"
                  >
                    <img
                      src={image.url}
                      alt="블로그 이미지"
                      className="h-40 w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="size-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                등록된 이미지가 없습니다
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button onClick={() => setIsImageDialogOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
