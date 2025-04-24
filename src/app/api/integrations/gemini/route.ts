import { NextRequest, NextResponse } from "next/server";

import { API_ENDPOINT } from "@/constant/gemini";
import { BLOG_REVIEW_TEMPLATE } from "@/constant/prompts";
import { fillPromptTemplate } from "@/lib/stringFill";
import { PromptData } from "@/types/prompt";

// 재시도 설정
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000; // 2초 (에러 메시지에서 제안한 대기 시간)

// 지수 백오프 함수 - 재시도할 때마다 대기 시간이 늘어남
const getRetryDelay = (attempt: number): number => {
  return INITIAL_RETRY_DELAY * Math.pow(2, attempt);
};

// 지연 함수 - 지정된 시간(ms)만큼 대기
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Gemini API 호출 함수 (재시도 로직 포함)
async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < MAX_RETRIES) {
    try {
      // API 요청 시도
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.0,
            maxOutputTokens: 2048,
          },
        }),
      });

      // 성공한 경우
      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }

      // 429 에러(요청 제한)인 경우 재시도
      if (response.status === 429) {
        // 에러 응답 정보 확인
        const errorBody = await response.text();
        console.warn(
          `API 요청 제한 도달 (시도 ${attempt + 1}/${MAX_RETRIES}):`,
          errorBody,
        );

        // 다음 시도 전 지연 시간 계산
        const retryDelay = getRetryDelay(attempt);
        console.log(`${retryDelay / 1000}초 후 재시도...`);
        await delay(retryDelay);

        attempt++;
        continue;
      }

      // 다른 HTTP 에러인 경우
      throw new Error(
        `Gemini API 오류: ${response.status} - ${await response.text()}`,
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Gemini API 호출 실패 (시도 ${attempt + 1}/${MAX_RETRIES}):`,
        lastError.message,
      );

      // 다음 시도 전 지연
      const retryDelay = getRetryDelay(attempt);
      console.log(`${retryDelay / 1000}초 후 재시도...`);
      await delay(retryDelay);

      attempt++;
    }
  }

  // 모든 재시도 실패 후
  throw lastError || new Error("알 수 없는 오류로 Gemini API 호출 실패");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    // 사용자 입력 데이터 정리
    const promptData: PromptData = {
      storeName: formData.storeName,
      storeDetails: formData.storeDetails,
      storeURL: formData.storeURL,
      mainKeyword: formData.mainKeyword,
      subKeywords: formData.subKeywords.filter(Boolean).join(", "),
      customerGender: formData.customerGender,
      ageGroup: formData.ageGroup,
    };

    // 프롬프트 템플릿에 데이터 채우기
    const filledPrompt = fillPromptTemplate(BLOG_REVIEW_TEMPLATE, promptData);

    // 재시도 로직이 포함된 API 호출 함수 사용
    const text = await callGeminiAPI(filledPrompt, process.env.GEMINI_API_KEY);

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Gemini API 처리 중 오류:", error);
    return NextResponse.json(
      {
        error: `Gemini API 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
