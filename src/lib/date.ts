import { BlogPost } from "@/types/blog";

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const groupPostsByDate = (posts: BlogPost[]) => {
  const grouped = {};

  posts.forEach((post) => {
    const dateKey = formatDate(post.created_at);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(post);
  });

  return Object.keys(grouped)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((date) => ({
      date,
      posts: grouped[date],
    }));
};
