export async function crawlStoreInfo(url: string): Promise<string> {
  try {
    if (!url || url.trim() === "") {
      return "";
    }

    const response = await fetch("/api/integrations/crawler", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "크롤링 처리 중 오류가 발생했습니다");
    }

    return data.data?.introduction || "";
  } catch (error) {
    console.error("크롤링 오류:", error);
    return "";
  }
}
