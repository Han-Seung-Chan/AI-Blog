"use client";

import { Coins, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserPoints } from "@/services/user/user-service";
import { PointTransaction } from "@/types/points";

export function UserPointsInfo() {
  const [points, setPoints] = useState<number>(0);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserPoints();

        setPoints(data.points);
        setTransactions(data.transactions);
      } catch (err) {
        console.error("포인트 정보 조회 오류:", err);
        setError("포인트 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoints();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Coins className="mr-2 h-5 w-5" />내 포인트
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-primary text-3xl font-bold">{points} P</p>
              <p className="text-muted-foreground text-sm">현재 보유 포인트</p>
            </div>

            {transactions.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium">최근 거래 내역</h4>
                <div className="max-h-[200px] space-y-2 overflow-y-auto">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between border-b pb-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {transaction.description}
                          {transaction.blog_post && (
                            <span className="text-muted-foreground ml-1 text-xs">
                              ({transaction.blog_post.store_name})
                            </span>
                          )}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(
                            transaction.created_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <p
                        className={
                          transaction.amount > 0
                            ? "font-medium text-green-500"
                            : "font-medium text-red-500"
                        }
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount} P
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
