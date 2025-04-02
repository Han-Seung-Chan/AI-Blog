import { API_ENDPOINT } from "@/constant/gemini";
import { BLOG_REVIEW_TEMPLATE } from "@/constant/prompts";
import { fillPromptTemplate } from "@/lib/stringFill";
import { NextRequest, NextResponse } from "next/server";

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
    const promptData = {
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

    // API 요청 구성
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: filledPrompt }] }],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API 오류 응답:", errorBody);

      return NextResponse.json(
        { error: `Gemini API 오류: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Gemini API 처리 중 오류:", error);
    return NextResponse.json(
      { error: "Gemini API 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
