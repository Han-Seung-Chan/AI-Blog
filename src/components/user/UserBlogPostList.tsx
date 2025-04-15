"use client";

import {
  Check,
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  FileX,
} from "lucide-react";
import { useEffect, useState } from "react";

import { CompleteBlogModal } from "@/components/dialog/CompleteBlogModal";
import { ViewResultModal } from "@/components/dialog/ViewResultModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  completeBlogPost,
  getMyAssignments,
  resubmitBlogPost,
} from "@/services/blog/blog-service";
import { ResubmitBlogModal } from "@/components/dialog/ResubmitBlogModal";
import { getStatusClass, getStatusText } from "@/lib/status-info";

interface UserBlogPostListProps {
  onStatusChange?: () => void;
}

export function UserBlogPostList({ onStatusChange }: UserBlogPostListProps) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isCompleteBlogModal, setIsCompleteBlogModal] = useState(false);
  const [isViewResultModal, setIsViewResultModal] = useState(false);
  const [selectedAiContent, setSelectedAiContent] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [isResubmitBlogModal, setIsResubmitBlogModal] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

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

      setIsCompleteBlogModal(false);
    } catch (error) {
      console.error("블로그 글 완료 처리 오류:", error);
      setUrlError("완료 처리 중 오류가 발생했습니다.");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleResubmit = async (blogUrl: string, notes: string) => {
    if (!selectedPost) return;

    try {
      setIsResubmitting(true);
      await resubmitBlogPost(selectedPost.id, blogUrl, notes);
      await fetchMyAssignments();
      if (onStatusChange) onStatusChange();
      setIsResubmitBlogModal(false);
    } catch (error) {
      console.error("블로그 글 재제출 오류:", error);
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleViewAiContent = (post) => {
    setSelectedAiContent(post.ai_content || "AI 콘텐츠가 없습니다.");
    setIsViewResultModal(true);
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
                          className={`flex items-center ${getStatusClass(post.status, "user")}`}
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
                          {post.status === "rejected" && (
                            <FileX className="mr-1 h-4 w-4" />
                          )}
                          {getStatusText(post.status, "user")}
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
                              setIsCompleteBlogModal(true);
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

                        {post.status === "rejected" && (
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
      <ViewResultModal
        isOpen={isViewResultModal}
        onOpenChange={setIsViewResultModal}
        title="블로그 컨텐츠"
        content={selectedAiContent}
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
      <ResubmitBlogModal
        isOpen={isResubmitBlogModal}
        onOpenChange={setIsResubmitBlogModal}
        selectedPost={selectedPost}
        onResubmit={handleResubmit}
        isResubmitting={isResubmitting}
      />
    </div>
  );
}
