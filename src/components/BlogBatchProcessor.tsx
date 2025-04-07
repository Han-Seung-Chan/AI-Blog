"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useBlogContentGenerator } from "@/hooks/useBlogContentGenerator";
import { ResultItem } from "@/components/ResultItem";
import { ExcelRowData } from "@/types/excel";

interface BlogBatchProcessorProps {
  data: ExcelRowData[];
  onReset: () => void;
}

export function BlogBatchProcessor({ data, onReset }: BlogBatchProcessorProps) {
  const {
    batchStatus,
    results,
    currentIndex,
    processedCount,
    successCount,
    failureCount,
    resetBatch,
    downloadResults,
  } = useBlogContentGenerator(data, onReset);

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
                <ResultItem
                  key={index}
                  result={result}
                  index={index}
                  currentIndex={currentIndex}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-muted/20 flex justify-between border-t p-4">
          <Button variant="outline" onClick={resetBatch} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            새로 시작하기
          </Button>

          <div className="space-x-2">
            {batchStatus === "completed" && successCount > 0 && (
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
