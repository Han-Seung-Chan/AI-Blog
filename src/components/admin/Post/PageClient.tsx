"use client";

import { useState } from "react";

import { BlogBatchProcessor } from "@/components/admin/Post/BlogBatchProcessor";
import { ExcelUploader } from "@/components/admin/Post/ExcelUploader";
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
