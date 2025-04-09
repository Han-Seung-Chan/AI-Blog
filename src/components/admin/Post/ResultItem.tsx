import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, XCircle, AlertCircle } from "lucide-react";
import { ProcessResult } from "@/types/workflow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const [isOpen, setIsOpen] = useState(false);

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectChange) {
      onSelectChange(index, e.target.checked);
    }
  };

  return (
    <tr
      className={`hover:bg-muted/20 border-b ${
        currentIndex === index ? "bg-blue-50 dark:bg-blue-900/10" : ""
      }`}
    >
      <td className="px-3 py-3">
        {result.status === "completed" && (
          <input
            type="checkbox"
            checked={result.isSelected || false}
            onChange={handleCheckboxChange}
            className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
          />
        )}
      </td>
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
          <>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
              결과 보기
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="w-[90vw] max-w-3xl p-4">
                <DialogHeader className="pb-2">
                  <DialogTitle>
                    {result.storeName || `데이터 #${index + 1}`} 블로그 글
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
                  <p className="text-base leading-relaxed break-words whitespace-pre-line">
                    {result.result}
                  </p>
                </div>
                <DialogFooter className="pt-4">
                  <Button onClick={() => setIsOpen(false)}>닫기</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
        {result.status === "failed" && (
          <span className="text-xs text-red-500">{result.error}</span>
        )}
      </td>
    </tr>
  );
}
