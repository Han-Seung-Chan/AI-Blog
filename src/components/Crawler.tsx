"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function CrawlerPage() {
  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCrawlSingle = async () => {
    if (!restaurantName) {
      setError("식당 이름을 입력해주세요");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/crawler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "single",
          name: restaurantName,
          location: location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "크롤링 처리 중 오류가 발생했습니다");
      }

      setResult(data.data);
    } catch (error) {
      console.error("오류:", error);
      setError(
        error instanceof Error
          ? error.message
          : "오류가 발생했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">
        네이버 지도 식당 정보 크롤러
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>식당 정보 입력</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">식당 이름</Label>
              <Input
                id="restaurantName"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="정확한 식당 이름을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">지역 (선택사항)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="지역을 입력하세요 (예: 목동)"
              />
            </div>

            <Button
              className="mt-4 w-full"
              onClick={handleCrawlSingle}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  크롤링 중...
                </>
              ) : (
                "식당 정보 크롤링"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>크롤링 결과</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="rounded-md bg-red-50 p-4 text-red-700">
                {error}
              </div>
            ) : loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">식당 정보</h3>
                  <p>이름: {result.name}</p>
                  <p>상세정보: {result.introduction || "정보 없음"}</p>
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-center text-gray-500">
                <p>
                  식당 이름을 입력하고 '식당 정보 크롤링' 버튼을 클릭하면 결과가
                  여기에 표시됩니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
