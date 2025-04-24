import { useEffect, useState } from "react";

import { getAvailableBlogPosts } from "@/services/blog/blog-service";
import { BlogPost } from "@/types/blog";

interface AvailableBlogPostsState {
  posts: BlogPost[];
  isLoading: boolean;
  error: string | null;
  refreshPosts: () => Promise<void>;
}

export function useAvailableBlogPosts(): AvailableBlogPostsState {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAvailableBlogPosts();
      setPosts(data);
    } catch (err) {
      console.error("작성 가능한 블로그 글 목록 조회 오류:", err);
      setError("블로그 글 목록을 가져오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, isLoading, error, refreshPosts: fetchPosts };
}
