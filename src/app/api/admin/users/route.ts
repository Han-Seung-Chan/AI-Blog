import { NextRequest, NextResponse } from "next/server";

import { verifyUserRole } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const { errorResponse } = await verifyUserRole(request, "admin");
    if (errorResponse) return errorResponse;

    // 모든 일반 사용자 정보 조회
    const { data: users, error } = await supabase
      .from("users")
      .select(
        "id, name, email, blog_id, phone, bank_name, account_number, points",
      )
      .eq("role", "user")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `사용자 정보 조회 오류: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("사용자 목록 조회 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
