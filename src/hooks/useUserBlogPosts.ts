import { useEffect,useState } from "react";

import { getMyAssignments } from "@/services/blog/blog-service";
import { BlogPost } from "@/types/blog";

export function useUserBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyAssignments();
      setPosts(data);
    } catch (err) {
      console.error("내 블로그 글 목록 조회 오류:", err);
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
