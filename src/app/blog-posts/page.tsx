import { AppLayout } from "@/components/layouts/AppLayout";
import { AvailableBlogPostList } from "@/components/user/AvailableBlogPostList";

export default function AvailableBlogPostsPage() {
  return (
    <AppLayout>
      <h1 className="mb-6 text-3xl font-bold">작성 가능한 블로그 글</h1>
      <AvailableBlogPostList />
    </AppLayout>
  );
}
