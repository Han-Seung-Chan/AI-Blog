import { PageClient } from "@/components/admin/Post/PageClient";
import { AppLayout } from "@/components/layouts/AppLayout";

export default function CreateBlogPostPage() {
  return (
    <AppLayout adminOnly>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">새 블로그 글 생성</h1>
        <PageClient />
      </div>
    </AppLayout>
  );
}
