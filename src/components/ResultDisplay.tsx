import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ResultDisplayProps {
  error: string;
  loading: boolean;
  result: string;
}

export function ResultDisplay({ error, loading, result }: ResultDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>생성된 마케팅 전략</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
        ) : loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : result ? (
          <div className="overflow-auto rounded-md bg-gray-50 p-4 break-words whitespace-pre-wrap">
            {result}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-center text-gray-500">
            <p>
              매장 정보를 입력하고 '마케팅 전략 생성' 버튼을 클릭하면 결과가
              여기에 표시됩니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
