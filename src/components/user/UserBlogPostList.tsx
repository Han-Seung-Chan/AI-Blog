"use client";

import { Check, ExternalLink, FileText, Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  completeBlogPost,
  getMyAssignments,
} from "@/services/blog/blog-service";

interface UserBlogPostListProps {
  onStatusChange?: () => void;
}

export function UserBlogPostList({ onStatusChange }: UserBlogPostListProps) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAiContentDialogOpen, setIsAiContentDialogOpen] = useState(false);
  const [selectedAiContent, setSelectedAiContent] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [urlError, setUrlError] = useState("");

  const fetchMyAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await getMyAssignments();
      setPosts(data);
    } catch (error) {
      console.error("내 블로그 글 목록 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAssignments();
  }, []);

  const handleComplete = async () => {
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
      await fetchMyAssignments();
      if (onStatusChange) onStatusChange();

      setIsDialogOpen(false);
    } catch (error) {
      console.error("블로그 글 완료 처리 오류:", error);
      setUrlError("완료 처리 중 오류가 발생했습니다.");
    } finally {
      setIsCompleting(false);
    }
  };

  // 상태에 따른 색상 클래스
  const getStatusClass = (status) => {
    switch (status) {
      case "reserved":
        return "text-yellow-500";
      case "completed":
        return "text-green-500";
      case "approved":
        return "text-blue-500";
      default:
        return "";
    }
  };

  // 상태 텍스트
  const getStatusText = (status) => {
    switch (status) {
      case "reserved":
        return "작성 중";
      case "completed":
        return "검수 중";
      case "approved":
        return "승인됨";
      default:
        return status;
    }
  };

  const handleViewAiContent = (post) => {
    setSelectedAiContent(post.ai_content || "AI 콘텐츠가 없습니다.");
    setIsAiContentDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">내 블로그 글 목록</h2>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">매장명</th>
                  <th className="px-4 py-3 text-left">키워드</th>
                  <th className="px-4 py-3 text-left">블로그 글</th>
                  <th className="px-4 py-3 text-left">상태</th>
                  <th className="px-4 py-3 text-left">블로그 링크</th>
                  <th className="px-4 py-3 text-left">작업</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-center">
                      예약된 블로그 글이 없습니다
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
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
                        <span
                          className={`flex items-center ${getStatusClass(post.status)}`}
                        >
                          {post.status === "reserved" && (
                            <Pencil className="mr-1 h-4 w-4" />
                          )}
                          {post.status === "completed" && (
                            <Check className="mr-1 h-4 w-4" />
                          )}
                          {post.status === "approved" && (
                            <Check className="mr-1 h-4 w-4" />
                          )}
                          {getStatusText(post.status)}
                        </span>
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
                        {post.status === "reserved" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post);
                              setBlogUrl("");
                              setNotes("");
                              setUrlError("");
                              setIsDialogOpen(true);
                            }}
                          >
                            완료하기
                          </Button>
                        )}

                        {post.status === "completed" && (
                          <span className="text-muted-foreground text-sm">
                            검수 대기 중
                          </span>
                        )}

                        {post.status === "approved" && (
                          <span className="text-sm text-green-500">승인됨</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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

      {/* 완료 대화 상자 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>블로그 글 작성 완료</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <h3 className="mb-2 font-medium">{selectedPost?.store_name}</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              키워드: {selectedPost?.main_keyword}
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blogUrl">블로그 URL *</Label>
                <Input
                  id="blogUrl"
                  value={blogUrl}
                  onChange={(e) => setBlogUrl(e.target.value)}
                  placeholder="작성한 블로그 글의 URL을 입력하세요"
                />
                {urlError && (
                  <p className="text-destructive text-xs">{urlError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">메모 (선택사항)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="관리자에게 전달할 메모를 입력하세요"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleComplete} disabled={isCompleting}>
              {isCompleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "작성 완료"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
