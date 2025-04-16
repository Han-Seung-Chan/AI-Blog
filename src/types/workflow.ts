export type BatchStatus = "idle" | "processing" | "completed";

export type ProcessResultStatus =
  | "completed"
  | "failed"
  | "processing"
  | "waiting";

export interface ProcessResult {
  rowIndex: number;
  storeName: string;
  status: ProcessResultStatus;
  result?: string;
  error?: string;
  details?: string;
  isSelected?: boolean;
}

export interface GenerationData {
  storeName: string;
  storeDetails: string;
  storeURL: string;
  mainKeyword: string;
  subKeywords: string[];
  customerGender: string;
  ageGroup: string;
}
