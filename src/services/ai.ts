import { GenerationData } from "@/types/workflow";

export async function generateContent(
  formData: GenerationData,
): Promise<string> {
  try {
    const res = await fetch("/api/gemini", {
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

    return data.text;
  } catch (error) {
    console.error("Gemini API 오류:", error);
    throw error;
  }
}
