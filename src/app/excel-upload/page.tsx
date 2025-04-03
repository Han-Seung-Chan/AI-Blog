"use client";

import { useState } from "react";
import { ExcelUploader } from "@/components/ExcelUploader";
import { ExcelDataDisplay } from "@/components/ExcelDataDisplay";
import { ExcelRowData } from "@/app/api/excel/route";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ExcelUploadPage() {
  const [excelData, setExcelData] = useState<ExcelRowData[]>([]);
  const [selectedData, setSelectedData] = useState<ExcelRowData | null>(null);

  const handleDataLoaded = (data: ExcelRowData[]) => {
    setExcelData(data);
    setSelectedData(null); // 새 데이터가 로드되면 선택된 데이터 초기화
  };

  const handleDataSelect = (data: ExcelRowData) => {
    setSelectedData(data);
    // 여기서 선택된 데이터로 원하는 작업 수행
    console.log("선택된 데이터:", data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>

      <h1 className="mb-8 text-center text-3xl font-bold">
        엑셀 파일 업로드 및 데이터 관리
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <ExcelUploader onDataLoaded={handleDataLoaded} />

          {selectedData && (
            <div className="bg-muted/20 mt-8 rounded-lg border p-4">
              <h3 className="mb-2 text-lg font-medium">선택된 데이터</h3>
              <pre className="bg-muted max-h-80 overflow-auto rounded-lg p-3 text-sm whitespace-pre-wrap">
                {JSON.stringify(selectedData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div>
          <ExcelDataDisplay data={excelData} onDataSelect={handleDataSelect} />
        </div>
      </div>
    </div>
  );
}
