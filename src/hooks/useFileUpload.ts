import { useState } from "react";

import { transformExcelData } from "@/lib/excelDataTransformer";
import { uploadExcelFile } from "@/services/integration/excel-service";
import { ExcelRowData } from "@/types/excel";

export function useFileUpload(onDataLoaded: (data: ExcelRowData[]) => void) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setUploadStatus("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("파일을 선택해주세요.");
      return;
    }

    // 확장자 확인
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "xlsx" && fileExtension !== "xls") {
      setUploadStatus("엑셀 파일(.xlsx 또는 .xls)만 업로드 가능합니다.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("파일 처리 중...");

    const result = await uploadExcelFile(selectedFile);

    if (result.success && result.data) {
      const cleanedData = transformExcelData(result.data);
      setUploadStatus("파일이 성공적으로 처리되었습니다.");
      onDataLoaded(cleanedData);
    } else {
      setUploadStatus(`오류: ${result.error}`);
    }

    setIsUploading(false);
  };

  return {
    selectedFile,
    uploadStatus,
    isUploading,
    handleFileChange,
    handleUpload,
  };
}
