"use client";

import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ReserveBlogModal } from "@/components/dialog/ReserveBlogModal";
import { ViewResultModal } from "@/components/dialog/ViewResultModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAvailableBlogPosts,
  reserveBlogPost,
} from "@/services/blog/blog-service";

export function AvailableBlogPostList() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isReserveBlogModal, setIsReserveBlogModal] = useState(false);
  const [isViewResultModal, setIsViewResultModal] = useState(false);
  const [selectedAiContent, setSelectedAiContent] = useState("");
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState("");

  const fetchAvailablePosts = async () => {
    try {
      setIsLoading(true);
      const data = await getAvailableBlogPosts();
      setPosts(data);
    } catch (error) {
      console.error("작성 가능한 블로그 글 목록 조회 오류:", error);
      setError("블로그 글 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailablePosts();
  }, []);

  const handleViewAiContent = (post) => {
    setSelectedAiContent(post.ai_content || "AI 콘텐츠가 없습니다.");
    setIsViewResultModal(true);
  };

  const handleReserve = async () => {
    if (!selectedPost) return;

    try {
      setIsReserving(true);
      await reserveBlogPost(selectedPost.id);

      // 예약 성공 시 내 대시보드로 이동
      router.push("/dashboard");
    } catch (error) {
      console.error("블로그 글 예약 오류:", error);
      setError("예약 처리 중 오류가 발생했습니다.");
      setIsReserving(false);
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">작성 가능한 블로그 글 목록</h2>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          내 대시보드로 돌아가기
        </Button>
      </div>

      {error && <p className="text-destructive">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">매장명</th>
                  <th className="px-4 py-3 text-left">키워드</th>
                  <th className="px-4 py-3 text-left">블로그 글</th>
                  <th className="px-4 py-3 text-left">매장 링크</th>
                  <th className="px-4 py-3 text-left">작업</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-center">
                      작성 가능한 블로그 글이 없습니다
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
                        {post.store_url ? (
                          <a
                            href={post.store_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center hover:underline"
                          >
                            매장 정보 <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPost(post);
                            setError("");
                            setIsReserveBlogModal(true);
                          }}
                        >
                          작성 예약
                        </Button>
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

      {/* 예약 확인 대화 상자 */}
      <ReserveBlogModal
        isOpen={isReserveBlogModal}
        onOpenChange={setIsReserveBlogModal}
        selectedPost={selectedPost}
        onReserve={handleReserve}
        isReserving={isReserving}
        error={error}
      />
    </div>
  );
}
