"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BlogBatchProcessor } from "@/components/admin/Post/BlogBatchProcessor";
import { ExcelUploader } from "@/components/admin/Post/ExcelUploader";
import { Button } from "@/components/ui/button";
import { ExcelRowData } from "@/types/excel";

export function PageClient() {
  const router = useRouter();

  const [excelData, setExcelData] = useState<ExcelRowData[]>([]);

  const handleDataLoaded = (data: ExcelRowData[]): void => {
    setExcelData(data);
  };

  const handleReset = (): void => {
    setExcelData([]);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">엑셀 파일로 글 작성하기</h2>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          내 대시보드로 돌아가기
        </Button>
      </div>
      <div className="space-y-8">
        {excelData.length === 0 ? (
          <ExcelUploader onDataLoaded={handleDataLoaded} />
        ) : (
          <BlogBatchProcessor data={excelData} onReset={handleReset} />
        )}
      </div>
    </>
  );
}
