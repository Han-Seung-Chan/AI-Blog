"use client";

import { useState } from "react";
import { ExcelUploader } from "@/components/ExcelUploader";
import { ExcelRowData } from "@/app/api/excel/route";
import { IntegratedWorkflow } from "@/components/IntegratedWorkflow";

export default function Home() {
  const [excelData, setExcelData] = useState<ExcelRowData[]>([]);

  const handleDataLoaded = (data: ExcelRowData[]) => {
    setExcelData(data);
  };

  const handleReset = () => {
    setExcelData([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">
        엑셀 데이터로 자동 블로그 글 생성
      </h1>

      <div className="space-y-8">
        {excelData.length === 0 ? (
          <ExcelUploader onDataLoaded={handleDataLoaded} />
        ) : (
          <IntegratedWorkflow data={excelData} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
