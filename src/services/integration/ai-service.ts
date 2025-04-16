import { createBlogPost } from "@/services/admin/admin-service";
import { GenerationData } from "@/types/workflow";

export async function generateContent(
  formData: GenerationData,
): Promise<string> {
  try {
    const res = await fetch("/api/integrations/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "요청 처리 중 오류가 발생했습니다");
    }

    // AI 생성 컨텐츠
    const aiContent = data.text || "";

    // Supabase에 저장 (관리자로 로그인한 경우)
    try {
      await createBlogPost(formData, aiContent);
    } catch (dbError) {
      console.warn("DB 저장 실패했지만 생성된 컨텐츠는 반환합니다:", dbError);
    }

    return aiContent;
  } catch (error) {
    console.error("Gemini API 오류:", error);
    throw error;
  }
}
