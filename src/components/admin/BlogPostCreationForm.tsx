"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { generateContent } from "@/services/ai";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function BlogPostCreationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    storeName: "",
    storeURL: "",
    mainKeyword: "",
    subKeywords: ["", "", ""],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubKeywordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const { value } = e.target;
    setFormData((prev) => {
      const newSubKeywords = [...prev.subKeywords];
      newSubKeywords[index] = value;
      return { ...prev, subKeywords: newSubKeywords };
    });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.storeName || !formData.mainKeyword) {
      setError("매장명과 대표 키워드는 필수 입력 항목입니다.");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      // 기존 generateContent 함수 활용
      const result = await generateContent({
        storeName: formData.storeName,
        storeDetails: "",
        storeURL: formData.storeURL,
        mainKeyword: formData.mainKeyword,
        subKeywords: formData.subKeywords.filter(Boolean),
        customerGender: "any",
        ageGroup: "all",
      });

      setGeneratedContent(result);

      // 생성 완료 후 대시보드로 이동
      router.push("/admin");
    } catch (err) {
      console.error("블로그 글 생성 오류:", err);
      setError("블로그 글 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">매장명 *</Label>
            <Input
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              placeholder="매장 이름을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeURL">매장 URL</Label>
            <Input
              id="storeURL"
              name="storeURL"
              value={formData.storeURL}
              onChange={handleInputChange}
              placeholder="네이버 플레이스 URL을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mainKeyword">대표 키워드 *</Label>
            <Input
              id="mainKeyword"
              name="mainKeyword"
              value={formData.mainKeyword}
              onChange={handleInputChange}
              placeholder="주요 키워드를 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>서브 키워드 (선택사항)</Label>
            <div className="grid grid-cols-3 gap-2">
              {formData.subKeywords.map((keyword, idx) => (
                <Input
                  key={idx}
                  value={keyword}
                  onChange={(e) => handleSubKeywordChange(e, idx)}
                  placeholder={`서브 키워드 ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                "AI 블로그 글 생성"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
