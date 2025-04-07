import { UploadExcelResult } from "@/types/excel";

export async function uploadExcelFile(file: File): Promise<UploadExcelResult> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/excel", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("파일 업로드 중 오류가 발생했습니다.");
    }

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: result.error || "알 수 없는 오류가 발생했습니다.",
      };
    }
  } catch (error) {
    console.error("파일 업로드 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}
