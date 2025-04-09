"use client";

import { ExternalLink,Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import {
  getAvailableBlogPosts,
  reserveBlogPost,
} from "@/services/blog/blog-service";

export function AvailableBlogPostList() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
                  <th className="px-4 py-3 text-left">서브 키워드</th>
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
                        {[
                          post.sub_keyword1,
                          post.sub_keyword2,
                          post.sub_keyword3,
                        ]
                          .filter(Boolean)
                          .join(", ") || "-"}
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
                            setIsDialogOpen(true);
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

      {/* 예약 확인 대화 상자 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>블로그 글 작성 예약</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <h3 className="mb-2 font-medium">{selectedPost?.store_name}</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              키워드: {selectedPost?.main_keyword}
            </p>

            <p>
              이 블로그 글 작성을、예약하시겠습니까? 예약 후에는 블로그 글을
              작성하고 완료 처리해야 합니다.
            </p>

            {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleReserve} disabled={isReserving}>
              {isReserving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "예약하기"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
