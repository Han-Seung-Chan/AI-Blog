"use client";

import { useState } from "react";

export type StoreFormData = {
  storeName: string;
  storeDetails: string;
  storeURL: string;
  mainKeyword: string;
  subKeywords: string[];
  customerGender: string;
  ageGroup: string;
};

export function useGeminiGeneration() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateContent = async (formData: StoreFormData) => {
    setLoading(true);
    setError("");

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

      setResult(data.text);
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

  return {
    result,
    loading,
    error,
    generateContent,
  };
}
