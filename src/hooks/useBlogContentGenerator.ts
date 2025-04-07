import { useState, useEffect, useCallback } from "react";
import { ExcelRowData } from "@/types/excel";
import { ProcessResult, BatchStatus, GenerationData } from "@/types/workflow";
import { generateContent } from "@/services/ai";
import { getRandomAgeGroup, getRandomGender } from "@/lib/random";

export function useBlogContentGenerator(
  data: ExcelRowData[],
  onReset: () => void,
) {
  const [batchStatus, setBatchStatus] = useState<BatchStatus>("idle");
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [failureCount, setFailureCount] = useState<number>(0);

  const processRow = async (
    row: ExcelRowData,
    index: number,
  ): Promise<void> => {
    try {
      setCurrentIndex(index);
      setResults((prev) =>
        prev.map((result, idx) =>
          idx === index ? { ...result, status: "processing" } : result,
        ),
      );

      const storeUrl = (row.storeURL as string) || "";
      // 네이버 지도 상세 정보 크롤링
      // const crawledDetails = await crawlStoreInfo(storeUrl);

      const subKeywords = [
        row.subKeyword1 || "",
        row.subKeyword2 || "",
        row.subKeyword3 || "",
      ].filter(Boolean);

      const storeName = (row.storeName as string) || "무제 매장";
      const mainKeyword = (row.mainKeyword as string) || "";
      const ageGroup = getRandomAgeGroup();
      const customerGender = getRandomGender();

      const generationData: GenerationData = {
        storeName,
        // storeDetails: crawledDetails || "매장 정보가 제공되지 않았습니다.",
        storeDetails: "매장 정보가 제공되지 않았습니다.",
        storeURL: storeUrl,
        mainKeyword,
        subKeywords,
        customerGender,
        ageGroup,
      };

      const generatedContent = await generateContent(generationData);
      setResults((prev) =>
        prev.map((result, idx) =>
          idx === index
            ? {
                ...result,
                status: "completed",
                result: generatedContent,
              }
            : result,
        ),
      );

      setSuccessCount((prev) => prev + 1);
    } catch (error) {
      setResults((prev) =>
        prev.map((result, idx) =>
          idx === index
            ? {
                ...result,
                status: "failed",
                error:
                  error instanceof Error
                    ? error.message
                    : "알 수 없는 오류가 발생했습니다",
              }
            : result,
        ),
      );

      setFailureCount((prev) => prev + 1);
    } finally {
      setProcessedCount((prev) => prev + 1);
    }
  };

  const startProcessing = useCallback(async () => {
    setBatchStatus("processing");

    for (let i = 0; i < data.length; i++) {
      await processRow(data[i], i);
    }

    setBatchStatus("completed");
  }, [data]);

  useEffect(() => {
    if (data.length > 0) {
      const initialResults: ProcessResult[] = data.map((row, index) => ({
        rowIndex: index,
        storeName: row.storeName || `데이터 #${index + 1}`,
        status: "waiting",
      }));

      setResults(initialResults);
      setBatchStatus("idle");
      setCurrentIndex(-1);
      setProcessedCount(0);
      setSuccessCount(0);
      setFailureCount(0);

      startProcessing();
    }
  }, [data, startProcessing]);

  const resetBatch = () => {
    onReset();
  };

  const downloadResults = () => {
    const successfulResults = results
      .filter((r) => r.status === "completed")
      .map((r) => ({
        storeName: r.storeName,
        content: r.result || "",
      }));

    if (successfulResults.length === 0) {
      alert("다운로드할 결과가 없습니다.");
      return;
    }

    const jsonString = JSON.stringify(successfulResults, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `blog-contents-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    batchStatus,
    results,
    currentIndex,
    processedCount,
    successCount,
    failureCount,
    resetBatch,
    downloadResults,
  };
}
