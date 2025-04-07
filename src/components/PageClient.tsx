"use client";

import { useState } from "react";
import { ExcelUploader } from "@/components/ExcelUploader";
import { BlogBatchProcessor } from "@/components/BlogBatchProcessor";
import { ExcelRowData } from "@/types/excel";

export function PageClient() {
  const [excelData, setExcelData] = useState<ExcelRowData[]>([]);

  const handleDataLoaded = (data: ExcelRowData[]) => {
    setExcelData(data);
  };

  const handleReset = () => {
    setExcelData([]);
  };

  return (
    <div className="space-y-8">
      {excelData.length === 0 ? (
        <ExcelUploader onDataLoaded={handleDataLoaded} />
      ) : (
        <BlogBatchProcessor data={excelData} onReset={handleReset} />
      )}
    </div>
  );
}
