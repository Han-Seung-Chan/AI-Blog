"use client";

import { StoreForm } from "@/components/StoreForm";
import { ResultDisplay } from "@/components/ResultDisplay";
import { useGeminiGeneration } from "@/hooks/useGeminiGeneration";
import CrawlerPage from "@/components/Crawler";

export default function Home() {
  const { result, loading, error, generateContent } = useGeminiGeneration();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">
        매장 마케팅 전략 생성기
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <StoreForm onSubmit={generateContent} isLoading={loading} />
        <ResultDisplay error={error} loading={loading} result={result} />
      </div>

      <CrawlerPage />
    </div>
  );
}
