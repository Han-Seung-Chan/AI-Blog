import { Button } from "@/components/ui/button";
import { Check, Loader2, XCircle, AlertCircle } from "lucide-react";
import { ProcessResult } from "@/types/workflow";

interface ResultItemProps {
  result: ProcessResult;
  index: number;
  currentIndex: number;
}

export function ResultItem({ result, index, currentIndex }: ResultItemProps) {
  return (
    <tr
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
              alert(result.result);
            }}
          >
            결과 보기
          </Button>
        )}
        {result.status === "failed" && (
          <span className="text-xs text-red-500">{result.error}</span>
        )}
      </td>
    </tr>
  );
}
