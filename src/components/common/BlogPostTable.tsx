import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <Card className="p-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className={headerClassName}>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.title}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    {columns.map((column) => (
                      <TableCell key={`${post.id}-${column.key}`}>
                        {column.render
                          ? column.render(post)
                          : post[column.key] || "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
