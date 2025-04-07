export interface ExcelRowData {
  [key: string]: string | number | boolean | null;
  storeName?: string;
  storeURL?: string;
  mainKeyword?: string;
  subKeyword1?: string;
  subKeyword2?: string;
  subKeyword3?: string;
}

export interface UploadExcelResult {
  success: boolean;
  data?: ExcelRowData[];
  error?: string;
}
