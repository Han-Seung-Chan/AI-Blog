"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserDailyWorkCount } from "@/services/user/user-service";

interface DailyWorkCount {
  current_count: number;
  max_count: number;
  remaining_count: number;
  can_work: boolean;
}

export function DailyWorkLimitInfo() {
  const [workCount, setWorkCount] = useState<DailyWorkCount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkCount = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserDailyWorkCount();
        setWorkCount(data);
      } catch (err: any) {
        console.error("작업 횟수 정보 조회 오류:", err);
        setError("작업 횟수 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkCount();

    // // 30초마다 자동 새로고침
    // const interval = setInterval(fetchWorkCount, 30000);
    // return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!workCount) return "text-blue-500";

    const { current_count, max_count } = workCount;
    console.log(workCount);
    console.log(max_count);
    if (current_count >= max_count) return "text-red-500";
    if (current_count >= max_count * 0.7) return "text-orange-500";
    return "text-green-500";
  };

  const getProgressBarColor = () => {
    if (!workCount) return "bg-blue-500";

    const { current_count, max_count } = workCount;
    if (current_count >= max_count) return "bg-red-500";
    if (current_count >= max_count * 0.7) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          오늘의 작업 현황
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : workCount ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">작업 완료</span>
              <span className={`font-bold ${getStatusColor()}`}>
                {workCount.current_count} / {workCount.max_count}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full ${getProgressBarColor()}`}
                style={{
                  width: `${(workCount.current_count / workCount.max_count) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span>0</span>
              <span>{workCount.max_count}</span>
            </div>
            {!workCount.can_work && (
              <div className="text-destructive mt-2 flex items-center text-xs">
                <AlertCircle className="mr-1 h-3 w-3" />
                오늘 작업 가능한 횟수를 모두 사용했습니다.
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            작업 횟수 정보를 불러오는 중입니다...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
