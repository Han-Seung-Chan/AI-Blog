export type BatchStatus = "idle" | "processing" | "completed";

export interface ProcessResult {
  rowIndex: number;
  storeName: string;
  status: "completed" | "failed" | "processing" | "waiting";
  result?: string;
  error?: string;
  details?: string;
}

export interface GenerationData {
  storeName: string;
  storeDetails: string;
  // storeURL: string;
  mainKeyword: string;
  subKeywords: string[];
  customerGender: string;
  ageGroup: string;
}
