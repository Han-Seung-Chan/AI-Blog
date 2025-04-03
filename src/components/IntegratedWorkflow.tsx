"use client";

import { useState, useEffect } from "react";
import { ExcelRowData } from "@/app/api/excel/route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, Check, XCircle, AlertCircle } from "lucide-react";
import { transformExcelData } from "@/lib/excelDataTransformer";

// 처리 결과 인터페이스
interface ProcessResult {
  rowIndex: number;
  storeName: string;
  status: "completed" | "failed" | "processing" | "waiting";
  result?: string;
  error?: string;
  details?: string;
}

// 배치 처리기 상태 정의
type BatchStatus = "idle" | "processing" | "completed" | "stopped";

interface IntegratedWorkflowProps {
  data: ExcelRowData[];
  onReset: () => void;
}

export function IntegratedWorkflow({ data, onReset }: IntegratedWorkflowProps) {
  const [batchStatus, setBatchStatus] = useState<BatchStatus>("idle");
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [failureCount, setFailureCount] = useState<number>(0);

  // 연령대 목록
  const ageGroups = ["10s", "20s", "30s", "40s", "50s"];

  // 처리 데이터 초기화
  useEffect(() => {
    if (data.length > 0) {
      // 데이터가 변경되면 결과 배열 초기화
      const cleanedData = transformExcelData(data);
      const initialResults: ProcessResult[] = cleanedData.map((row, index) => ({
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

      // 데이터가 로드되면 자동으로 처리 시작
      startProcessing(cleanedData);
    }
  }, [data]);

  // 랜덤 연령대 및 성별 선택
  const getRandomAgeGroup = (): string => {
    const randomIndex = Math.floor(Math.random() * ageGroups.length);
    return ageGroups[randomIndex];
  };

  const getRandomGender = (): string => {
    return Math.random() > 0.5 ? "male" : "female";
  };

  // 크롤링 함수
  const crawlStoreInfo = async (url: string): Promise<string> => {
    try {
      if (!url || url.trim() === "") {
        return ""; // URL이 비어있으면 빈 문자열 반환
      }

      const response = await fetch("/api/crawler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "크롤링 처리 중 오류가 발생했습니다");
      }

      if (data.data && data.data.introduction) {
        return data.data.introduction;
      } else {
        return ""; // 매장 정보가 없으면 빈 문자열 반환
      }
    } catch (error) {
      console.error("크롤링 오류:", error);
      return ""; // 오류 발생 시 빈 문자열 반환하고 계속 진행
    }
  };

  // AI 콘텐츠 생성 함수
  const generateContent = async (formData: any): Promise<string> => {
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "요청 처리 중 오류가 발생했습니다");
      }

      return data.text;
    } catch (error) {
      console.error("Gemini API 오류:", error);
      throw error;
    }
  };

  // 단일 행 처리 함수
  const processRow = async (
    row: ExcelRowData,
    index: number,
  ): Promise<void> => {
    try {
      // 현재 처리 중인 행 업데이트
      setCurrentIndex(index);

      // 상태 업데이트
      setResults((prev) =>
        prev.map((result, idx) =>
          idx === index ? { ...result, status: "processing" } : result,
        ),
      );

      // 1. 크롤링 단계
      const storeUrl = (row.storeURL as string) || "";
      const crawledDetails = await crawlStoreInfo(storeUrl);

      // 2. AI 생성 단계
      // 서브키워드 배열 구성 (값이 없으면 빈 문자열로)
      const subKeywords = [
        row.subKeyword1 || "",
        row.subKeyword2 || "",
        row.subKeyword3 || "",
      ].filter(Boolean);

      // 필수 값이 비어있으면 빈 문자열로 처리
      const storeName = (row.storeName as string) || "무제 매장";
      const mainKeyword = (row.mainKeyword as string) || "";

      // 랜덤 값 생성
      const ageGroup = getRandomAgeGroup();
      const customerGender = getRandomGender();

      // 요청 데이터 구성
      const generationData = {
        storeName,
        storeDetails: crawledDetails || "매장 정보가 제공되지 않았습니다.",
        storeURL: storeUrl,
        mainKeyword,
        subKeywords,
        customerGender,
        ageGroup,
      };

      // AI 콘텐츠 생성 요청
      const generatedContent = await generateContent(generationData);

      // 처리 성공 결과 저장
      setResults((prev) =>
        prev.map((result, idx) =>
          idx === index
            ? {
                ...result,
                status: "completed",
                result: generatedContent,
                details: crawledDetails,
              }
            : result,
        ),
      );

      // 성공 카운트 증가
      setSuccessCount((prev) => prev + 1);
    } catch (error) {
      // 오류 발생 시 결과 저장
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

      // 실패 카운트 증가
      setFailureCount((prev) => prev + 1);
    } finally {
      // 처리 완료 카운트 증가
      setProcessedCount((prev) => prev + 1);
    }
  };

  // 배치 처리 시작 함수
  const startProcessing = async (dataToProcess: ExcelRowData[]) => {
    setBatchStatus("processing");

    // 모든 행을 순차적으로 처리
    for (let i = 0; i < dataToProcess.length; i++) {
      // 처리가 중단되었는지 확인
      if (batchStatus === "stopped") {
        break;
      }

      await processRow(dataToProcess[i], i);
    }

    // 모든 처리 완료
    setBatchStatus("completed");
  };

  // 처리 중단 함수
  const stopProcessing = () => {
    setBatchStatus("stopped");
  };

  // 리셋 함수
  const resetBatch = () => {
    onReset();
    setBatchStatus("idle");
    setResults([]);
    setCurrentIndex(-1);
    setProcessedCount(0);
    setSuccessCount(0);
    setFailureCount(0);
  };

  // 배치 결과 다운로드 함수
  const downloadResults = () => {
    // 성공한 결과만 추출
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

    // JSON 파일로 변환
    const jsonString = JSON.stringify(successfulResults, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // 다운로드 링크 생성 및 클릭
    const a = document.createElement("a");
    a.href = url;
    a.download = `blog-contents-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center justify-between">
          <span>일괄 처리 ({data.length}개 항목)</span>
          <div className="flex space-x-2 text-sm">
            <span className="rounded bg-green-100 px-2 py-1 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              성공: {successCount}
            </span>
            <span className="rounded bg-red-100 px-2 py-1 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              실패: {failureCount}
            </span>
            <span className="rounded bg-blue-100 px-2 py-1 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              진행률:{" "}
              {data.length > 0
                ? Math.round((processedCount / data.length) * 100)
                : 0}
              %
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* 진행 상태 표시 바 */}
        {batchStatus !== "idle" && (
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700">
            <div
              className="bg-primary h-2 transition-all duration-300"
              style={{
                width: `${data.length > 0 ? (processedCount / data.length) * 100 : 0}%`,
              }}
            ></div>
          </div>
        )}

        {/* 결과 목록 */}
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">매장명</th>
                <th className="px-4 py-2 text-left">상태</th>
                <th className="px-4 py-2 text-left">작업</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr
                  key={index}
                  className={`hover:bg-muted/20 border-b ${currentIndex === index ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                >
                  <td className="max-w-[200px] truncate px-4 py-3">
                    {result.storeName || `데이터 #${index + 1}`}
                  </td>
                  <td className="px-4 py-3">
                    {result.status === "waiting" && (
                      <span className="flex items-center text-gray-500">
                        <AlertCircle className="mr-1 h-4 w-4" />
                        대기중
                      </span>
                    )}
                    {result.status === "processing" && (
                      <span className="flex items-center text-blue-500">
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        처리중
                      </span>
                    )}
                    {result.status === "completed" && (
                      <span className="flex items-center text-green-500">
                        <Check className="mr-1 h-4 w-4" />
                        완료
                      </span>
                    )}
                    {result.status === "failed" && (
                      <span className="flex items-center text-red-500">
                        <XCircle className="mr-1 h-4 w-4" />
                        실패
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {result.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // 모달로 결과 표시 또는 간단한 방법으로 결과 표시
                          alert(result.result);
                        }}
                      >
                        결과 보기
                      </Button>
                    )}
                    {result.status === "failed" && (
                      <span className="text-xs text-red-500">
                        {result.error}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 버튼 영역 */}
        <div className="bg-muted/20 flex justify-between border-t p-4">
          <Button variant="outline" onClick={resetBatch} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            새로 시작하기
          </Button>

          <div className="space-x-2">
            {batchStatus === "processing" && (
              <Button
                variant="destructive"
                onClick={stopProcessing}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                중단
              </Button>
            )}

            {(batchStatus === "completed" || batchStatus === "stopped") &&
              successCount > 0 && (
                <Button onClick={downloadResults} className="gap-2">
                  결과 다운로드
                </Button>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
