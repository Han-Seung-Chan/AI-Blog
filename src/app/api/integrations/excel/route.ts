import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// 엑셀 파일에서 읽어온 데이터의 구조를 정의할 인터페이스
export interface ExcelRowData {
  [key: string]: string | number | boolean | null;
}

/**
 * 엑셀 파일 처리 API 엔드포인트
 */
export async function POST(request: NextRequest) {
  try {
    // multipart/form-data 요청 처리
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "파일이 제공되지 않았습니다." },
        { status: 400 },
      );
    }

    // 파일 확장자 확인
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "지원되지 않는 파일 형식입니다. .xlsx 또는 .xls 파일만 업로드 가능합니다.",
        },
        { status: 400 },
      );
    }

    // 파일 데이터를 ArrayBuffer로 변환
    const fileBuffer = await file.arrayBuffer();

    // 엑셀 워크북 로드
    const workbook = XLSX.read(fileBuffer, {
      type: "array",
      cellDates: true, // 날짜를 날짜 객체로 파싱
      cellNF: true, // 숫자 형식 유지
      cellText: false, // 수식을 값으로 변환
    });

    // 첫 번째 워크시트 선택
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // 두 가지 방법으로 데이터 추출 (타입 안전하게)

    // 1. 먼저 header 정보를 배열로 추출 (첫 번째 행)
    const rawHeaders = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      blankrows: false,
      range: 0, // 첫 번째 행만 가져오기
    });

    if (!rawHeaders || rawHeaders.length === 0) {
      return NextResponse.json(
        { success: false, error: "파일에 데이터가 없습니다." },
        { status: 400 },
      );
    }

    // 첫 번째 행을 헤더로 타입 안전하게 추출
    const headers = rawHeaders[0] as unknown as string[];

    // 2. 실제 데이터 행들을 객체 배열로 추출 (헤더 정보를 칼럼명으로 사용)
    const rows = XLSX.utils.sheet_to_json<ExcelRowData>(worksheet, {
      defval: null, // 빈 셀은 null로 설정
      blankrows: false, // 빈 행 무시
    });

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "파일에 데이터 행이 없습니다." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: rows,
      message: `${rows.length}개의 데이터가 성공적으로 로드되었습니다.`,
    });
  } catch (error) {
    console.error("엑셀 파일 처리 중 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: `엑셀 파일 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
