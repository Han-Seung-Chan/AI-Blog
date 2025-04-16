import { ExcelRowData } from "@/types/excel";

export function transformExcelData(rows: any[]): ExcelRowData[] {
  // 필드명 매핑 정의
  const fieldMapping: Record<string, keyof ExcelRowData> = {
    상호명: "storeName",
    "네이버 플레이스 주소": "storeURL",
    "대표 키워드": "mainKeyword",
    "서브 키워드1": "subKeyword1",
    "서브 키워드2": "subKeyword2",
    "서브 키워드3": "subKeyword3",
  };

  return rows.map((row) => {
    const transformedRow: ExcelRowData = {};

    // 원본 데이터의 각 필드를 순회
    Object.entries(row).forEach(([key, value]) => {
      // 개행 문자 제거하여 정리된 키 생성
      const cleanKey = key.replace(/\n/g, "").trim();

      // 해당하는 매핑 키 찾기
      const mappedKey =
        fieldMapping[cleanKey] || (cleanKey as keyof ExcelRowData);

      // 값이 문자열인 경우 개행 문자 제거
      let cleanValue: string | number | boolean | null = null;

      if (typeof value === "string") {
        cleanValue = value.replace(/\n/g, "").trim();
      } else if (typeof value === "number" || typeof value === "boolean") {
        cleanValue = value;
      }

      // 정제된 키와 값을 새 객체에 저장
      transformedRow[mappedKey] = cleanValue;
    });

    return transformedRow;
  });
}
