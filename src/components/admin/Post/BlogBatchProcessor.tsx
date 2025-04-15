"use client";

import { Download, RefreshCcw } from "lucide-react";

import { ResultItem } from "@/components/admin/Post/ResultItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBlogContentGenerator } from "@/hooks/useBlogContentGenerator";
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
    allSelected,
    hasCompletedItems,
    selectedCount,
    resetBatch,
    downloadResults,
    handleSelectChange,
    toggleSelectAll,
  } = useBlogContentGenerator(data, onReset);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center justify-between">
          <span>일괄 처리 ({data.length}개 항목)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted sticky top-0">
              <TableRow>
                <TableHead className="px-3 py-2 text-left">
                  {hasCompletedItems && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                      />
                      <span className="ml-2 text-xs">전체</span>
                    </div>
                  )}
                </TableHead>
                <TableHead className="px-4 py-2 text-left">매장명</TableHead>
                <TableHead className="px-4 py-2 text-left">상태</TableHead>
                <TableHead className="px-4 py-2 text-left">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <ResultItem
                  key={index}
                  result={result}
                  index={index}
                  currentIndex={currentIndex}
                  onSelectChange={handleSelectChange}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-muted/20 flex justify-between border-t p-4">
          <Button variant="outline" onClick={resetBatch} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            새로 시작하기
          </Button>

          <div className="space-x-2">
            {/* 완료된 항목이 있고 선택된 항목이 있을 때만 다운로드 버튼 활성화 */}
            {batchStatus === "completed" && hasCompletedItems && (
              <Button
                onClick={downloadResults}
                className="gap-2"
                disabled={selectedCount === 0}
              >
                <Download className="h-4 w-4" />
                선택항목 다운로드 ({selectedCount})
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
