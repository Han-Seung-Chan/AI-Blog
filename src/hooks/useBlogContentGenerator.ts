import JSZip from "jszip";
import { useEffect, useState } from "react";

import { getRandomAgeGroup, getRandomGender } from "@/lib/random";
import { generateContent } from "@/services/integration/ai-service";
import { ExcelRowData } from "@/types/excel";
import { BatchStatus, GenerationData, ProcessResult } from "@/types/workflow";

interface BlogContentGeneratorState {
  batchStatus: BatchStatus;
  results: ProcessResult[];
  currentIndex: number;
  allSelected: boolean;
  hasCompletedItems: boolean;
  selectedCount: number;
  resetBatch: () => void;
  downloadResults: () => Promise<void>;
  handleSelectChange: (index: number, isSelected: boolean) => void;
  toggleSelectAll: () => void;
}

export function useBlogContentGenerator(
  data: ExcelRowData[],
  onReset: () => void,
): BlogContentGeneratorState {
  const [batchStatus, setBatchStatus] = useState<BatchStatus>("idle");
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // 숫자 대신 상태를 나타내는 boolean 값들
  const [hasCompletedItems, setHasCompletedItems] = useState<boolean>(false);
  const [allSelected, setAllSelected] = useState<boolean>(false);

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
                isSelected: true,
              }
            : result,
        ),
      );

      // 성공 항목 추가
      setHasCompletedItems(true);
    } catch (error: any) {
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
                isSelected: false,
              }
            : result,
        ),
      );
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      // 모든 상태 초기화
      const initialResults: ProcessResult[] = data.map((row, index) => ({
        rowIndex: index,
        storeName: (row.storeName as string) || `데이터 #${index + 1}`,
        status: "waiting",
        isSelected: false,
      }));

      setResults(initialResults);
      setBatchStatus("idle");
      setCurrentIndex(-1);
      setHasCompletedItems(false);
      setAllSelected(false);

      // 즉시 실행 함수로 비동기 처리
      (async () => {
        setBatchStatus("processing");

        for (let i = 0; i < data.length; i++) {
          await processRow(data[i], i);
        }

        setBatchStatus("completed");
        setAllSelected(true);
      })();
    }
  }, [data]);

  // 체크박스 선택 상태 변경 핸들러
  const handleSelectChange = (index: number, isSelected: boolean): void => {
    setResults((prev) =>
      prev.map((result, idx) =>
        idx === index ? { ...result, isSelected } : result,
      ),
    );

    // 전체 선택 상태 업데이트
    const completedResults = results.filter((r) => r.status === "completed");
    const allItemsSelected =
      completedResults.length > 0 &&
      completedResults.every((r) => r.isSelected);

    setAllSelected(allItemsSelected);
  };

  // 전체 선택/해제 토글 핸들러
  const toggleSelectAll = (): void => {
    const newSelectAllState = !allSelected;
    setAllSelected(newSelectAllState);

    setResults((prev) =>
      prev.map((result) =>
        result.status === "completed"
          ? { ...result, isSelected: newSelectAllState }
          : result,
      ),
    );
  };

  const resetBatch = (): void => {
    onReset();
  };

  // ZIP 파일로 다운로드 함수
  const downloadResults = async (): Promise<void> => {
    const selectedResults = results.filter(
      (r) => r.status === "completed" && r.isSelected,
    );

    if (selectedResults.length === 0) {
      alert("다운로드할 항목을 선택해주세요.");
      return;
    }

    try {
      // JSZip 인스턴스 생성
      const zip = new JSZip();

      // 각 항목을 TXT 파일로 추가
      selectedResults.forEach((item) => {
        if (item.result) {
          // 파일명에 사용할 수 없는 문자 제거
          const safeStoreName = (item.storeName || "")
            .replace(/[\\/:*?"<>|]/g, "_")
            .trim();

          // TXT 파일로 추가
          zip.file(`${safeStoreName}.txt`, item.result);
        }
      });

      // ZIP 파일 생성
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // 다운로드 링크 생성 및 클릭
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blog-contents-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("ZIP 파일 생성 중 오류:", error);
      alert("파일 다운로드 중 오류가 발생했습니다.");
    }
  };

  // 선택된 항목 수 계산
  const selectedCount = results.filter(
    (r) => r.status === "completed" && r.isSelected,
  ).length;

  return {
    batchStatus,
    results,
    currentIndex,
    allSelected,
    hasCompletedItems,
    selectedCount,
    resetBatch,
    downloadResults,
    handleSelectChange,
    toggleSelectAll,
  };
}
