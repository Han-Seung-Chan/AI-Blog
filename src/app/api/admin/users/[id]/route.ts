import { NextRequest, NextResponse } from "next/server";

import { verifyUserRole } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const userId = params.id;
    const { blog_approval_points } = await request.json();

    // 관리자 권한 확인
    const { user, errorResponse } = await verifyUserRole(request, "admin");
    if (errorResponse) return errorResponse;

    // 유효성 검사
    if (typeof blog_approval_points !== "number" || blog_approval_points < 0) {
      return NextResponse.json(
        { error: "유효한 포인트 값을 입력해주세요." },
        { status: 400 },
      );
    }

    // 사용자 정보 업데이트
    const { data, error } = await supabase
      .from("users")
      .update({ blog_approval_points })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `사용자 정보 업데이트 오류: ${error.message}` },
        { status: 500 },
      );
    }

    // 활동 로그 기록
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update_user",
      notes: `사용자 ${userId}의 블로그 승인 포인트를 ${blog_approval_points}로 변경`,
      created_at: new Date(),
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("사용자 정보 업데이트 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
