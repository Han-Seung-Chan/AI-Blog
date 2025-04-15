import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { BlogPost, BlogTableColumn } from "@/types/blog";

interface BlogPostTableProps {
  posts: BlogPost[];
  columns: BlogTableColumn[];
  isLoading: boolean;
  emptyMessage?: string;
  headerClassName?: string;
}

export function BlogPostTable({
  posts,
  columns,
  isLoading,
  emptyMessage = "표시할 데이터가 없습니다.",
  headerClassName = "bg-muted/50",
}: BlogPostTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={headerClassName}>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 text-left">
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-3 text-center"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-t">
                    {columns.map((column) => (
                      <td
                        key={`${post.id}-${column.key}`}
                        className="px-4 py-3"
                      >
                        {column.render
                          ? column.render(post)
                          : post[column.key] || "-"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
