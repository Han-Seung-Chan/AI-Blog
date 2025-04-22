import { NextRequest, NextResponse } from "next/server";

import { verifyUserRole } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse } = await verifyUserRole(request, "user");
    if (errorResponse) return errorResponse;

    // 사용자의 일일 작업 횟수 조회
    const { data, error } = await supabase.rpc("get_daily_work_count", {
      p_user_id: user.id,
    });

    if (error) {
      return NextResponse.json(
        { error: `작업 횟수 조회 오류: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("일일 작업 횟수 조회 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 },
    );
  }
}
