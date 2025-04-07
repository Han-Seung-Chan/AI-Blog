import { PageClient } from "@/components/PageClient";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">
        엑셀 데이터로 자동 블로그 글 생성
      </h1>

      <PageClient />
    </div>
  );
}
