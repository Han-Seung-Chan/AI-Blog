import { AlertCircle, Check, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

import { ViewResultModal } from "@/components/dialog/ViewResultModal";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ProcessResult, ProcessResultStatus } from "@/types/workflow";

interface ResultItemProps {
  result: ProcessResult;
  index: number;
  currentIndex: number;
  onSelectChange?: (index: number, isSelected: boolean) => void;
}

export function ResultItem({
  result,
  index,
  currentIndex,
  onSelectChange,
}: ResultItemProps) {
  const [isViewResultModalOpen, setIsViewResultModalOpen] =
    useState<boolean>(false);

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (onSelectChange) {
      onSelectChange(index, e.target.checked);
    }
  };

  const getStatusComponent = (status: ProcessResultStatus) => {
    switch (status) {
      case "waiting":
        return (
          <span className="flex items-center text-gray-500">
            <AlertCircle className="mr-1 h-4 w-4" />
            대기중
          </span>
        );
      case "processing":
        return (
          <span className="flex items-center text-blue-500">
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            처리중
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center text-green-500">
            <Check className="mr-1 h-4 w-4" />
            완료
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center text-red-500">
            <XCircle className="mr-1 h-4 w-4" />
            실패
          </span>
        );
    }
  };

  return (
    <TableRow
      className={`hover:bg-muted/20 border-b ${
        currentIndex === index ? "bg-blue-50 dark:bg-blue-900/10" : ""
      }`}
    >
      <TableCell className="px-3 py-3">
        {result.status === "completed" && (
          <input
            type="checkbox"
            checked={result.isSelected || false}
            onChange={handleCheckboxChange}
            className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
          />
        )}
      </TableCell>
      <TableCell className="max-w-[200px] truncate px-4 py-3">
        {result.storeName || `데이터 #${index + 1}`}
      </TableCell>
      <TableCell className="px-4 py-3">
        {getStatusComponent(result.status)}
      </TableCell>
      <TableCell className="px-4 py-3">
        {result.status === "completed" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsViewResultModalOpen(true)}
            >
              결과 보기
            </Button>

            <ViewResultModal
              isOpen={isViewResultModalOpen}
              onOpenChange={setIsViewResultModalOpen}
              title={result.storeName || `데이터 #${index + 1}`}
              content={result.result || ""}
            />
          </>
        )}
        {result.status === "failed" && (
          <span className="text-xs text-red-500">{result.error}</span>
        )}
      </TableCell>
    </TableRow>
  );
}
