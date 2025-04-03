"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { StoreFormData } from "@/hooks/useGeminiGeneration";

interface StoreFormProps {
  onSubmit: (formData: StoreFormData) => void;
  isLoading: boolean;
}

export function StoreForm({ onSubmit, isLoading }: StoreFormProps) {
  const [formData, setFormData] = useState<StoreFormData>({
    storeName: "",
    storeDetails: "",
    storeURL: "",
    mainKeyword: "",
    subKeywords: ["", "", ""],
    customerGender: "male",
    ageGroup: "20s",
  });

  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlError, setCrawlError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubKeywordChange = (index: number, value: string) => {
    const newSubKeywords = [...formData.subKeywords];
    newSubKeywords[index] = value;
    setFormData({ ...formData, subKeywords: newSubKeywords });
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCrawlStoreInfo = async () => {
    // URL 필드 확인
    if (!formData.storeURL) {
      setCrawlError("매장 URL을 입력해주세요");
      return;
    }

    setCrawlError("");
    setIsCrawling(true);

    try {
      const res = await fetch("/api/crawler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formData.storeURL,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "크롤링 처리 중 오류가 발생했습니다");
      }

      if (data.data && data.data.introduction) {
        // 크롤링한 정보를 상세정보 필드에 채우기
        setFormData({
          ...formData,
          storeDetails: data.data.introduction,
        });
      } else {
        setCrawlError("매장 정보를 찾을 수 없습니다");
      }
    } catch (error) {
      console.error("크롤링 오류:", error);
      setCrawlError(
        error instanceof Error
          ? error.message
          : "오류가 발생했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setIsCrawling(false);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>매장 정보 입력</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="storeName">매장명</Label>
          <Input
            id="storeName"
            name="storeName"
            type="text"
            placeholder="매장명"
            value={formData.storeName}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeDetails">매장 상세정보</Label>
          <Textarea
            id="storeDetails"
            name="storeDetails"
            placeholder="매장에 대한 상세 설명을 입력하세요 (또는 '정보 가져오기' 버튼을 눌러 자동으로 가져오세요)"
            value={formData.storeDetails}
            onChange={handleInputChange}
            className="min-h-20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeURL">매장 주소 URL</Label>
          <div className="flex gap-2">
            <Input
              id="storeURL"
              name="storeURL"
              type="text"
              placeholder="네이버 지도 URL (예: https://map.naver.com/p/...)"
              value={formData.storeURL}
              onChange={handleInputChange}
              className="flex-1"
            />
            <Button
              onClick={handleCrawlStoreInfo}
              disabled={isCrawling || !formData.storeURL}
              variant="secondary"
            >
              {isCrawling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  정보 가져오는 중...
                </>
              ) : (
                "정보 가져오기"
              )}
            </Button>
          </div>
          {crawlError && (
            <p className="text-destructive mt-1 text-sm">{crawlError}</p>
          )}
          <p className="text-muted-foreground text-xs">
            네이버 지도 URL을 입력하고 '정보 가져오기' 버튼을 클릭하면 매장
            정보가 자동으로 채워집니다.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mainKeyword">메인 키워드</Label>
          <Input
            id="mainKeyword"
            name="mainKeyword"
            type="text"
            placeholder="메인 키워드"
            value={formData.mainKeyword}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label>서브 키워드</Label>
          <div className="grid grid-cols-3 gap-3">
            {formData.subKeywords.map((keyword, index) => (
              <Input
                key={index}
                type="text"
                placeholder={`서브 키워드 ${index + 1}`}
                value={keyword}
                onChange={(e) => handleSubKeywordChange(index, e.target.value)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>고객 성별</Label>
          <RadioGroup
            value={formData.customerGender}
            onValueChange={(value) =>
              handleRadioChange("customerGender", value)
            }
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">남자</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">여자</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>주요 타겟 연령대</Label>
          <RadioGroup
            value={formData.ageGroup}
            onValueChange={(value) => handleRadioChange("ageGroup", value)}
            className="grid grid-cols-3 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10s" id="10s" />
              <Label htmlFor="10s">10대</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="20s" id="20s" />
              <Label htmlFor="20s">20대</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="30s" id="30s" />
              <Label htmlFor="30s">30대</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="40s" id="40s" />
              <Label htmlFor="40s">40대</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="50s" id="50s" />
              <Label htmlFor="50s">50대</Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          className="mt-4 w-full"
          onClick={handleSubmit}
          disabled={isLoading || !formData.storeName || !formData.mainKeyword}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중...
            </>
          ) : (
            "마케팅 전략 생성"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
