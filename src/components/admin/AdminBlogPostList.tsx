"use client";

import {
  AlertCircle,
  Calendar,
  Check,
  ExternalLink,
  Loader2,
  User,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  approveBlogPost,
  getAllBlogPosts,
} from "@/services/admin/admin-service";

export function AdminBlogPostList() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getAllBlogPosts();
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
      await fetchBlogPosts(); // 목록 새로고침
      setIsDialogOpen(false);
    } catch (error) {
      console.error("블로그 글 승인 오류:", error);
    } finally {
      setIsApproving(false);
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

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">블로그 글 목록</h2>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">매장명</th>
                  <th className="px-4 py-3 text-left">키워드</th>
                  <th className="px-4 py-3 text-left">상태</th>
                  <th className="px-4 py-3 text-left">담당자</th>
                  <th className="px-4 py-3 text-left">블로그 링크</th>
                  <th className="px-4 py-3 text-left">작업</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center">
                      블로그 글이 없습니다
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="border-t">
                      <td className="px-4 py-3">{post.store_name}</td>
                      <td className="px-4 py-3">{post.main_keyword}</td>
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
                          >
                            승인하기
                          </Button>
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
    </div>
  );
}
