"use client";

import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ExcelRowData } from "@/types/excel";

interface ExcelUploaderProps {
  onDataLoaded: (data: ExcelRowData[]) => void;
  isLoading?: boolean;
}

export function ExcelUploader({
  onDataLoaded,
  isLoading = false,
}: ExcelUploaderProps) {
  const {
    selectedFile,
    uploadStatus,
    isUploading,
    handleFileChange,
    handleUpload,
  } = useFileUpload(onDataLoaded);

  return (
    <Card>
      <CardHeader>
        <CardTitle>엑셀 파일 업로드</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex w-full items-center justify-center">
          <label
            htmlFor="excel-file"
            className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700/20 dark:hover:bg-gray-700/30"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="mb-2 h-8 w-8 text-gray-500 dark:text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">클릭하여 파일 선택</span> 또는
                파일을 여기에 드래그 앤 드롭하세요
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Excel 파일 (.xlsx, .xls)
              </p>
            </div>
            <input
              id="excel-file"
              type="file"
              className="hidden"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              disabled={isUploading || isLoading}
            />
          </label>
        </div>

        {selectedFile && (
          <div className="text-sm font-medium">
            선택된 파일:{" "}
            <span className="font-normal">{selectedFile.name}</span>
          </div>
        )}

        {uploadStatus && (
          <div
            className={`text-sm ${uploadStatus.includes("오류") ? "text-destructive" : "text-green-500"}`}
          >
            {uploadStatus}
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading || isLoading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            "파일 업로드"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
