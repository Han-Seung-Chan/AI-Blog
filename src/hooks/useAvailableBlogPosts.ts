import { useEffect,useState } from "react";

import { getAvailableBlogPosts } from "@/services/blog/blog-service";
import { BlogPost } from "@/types/blog";

export function useAvailableBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
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
