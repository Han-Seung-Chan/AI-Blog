import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { verifyUserRole } from "@/lib/auth-middleware";

// 현재 사용자의 포인트 조회
export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse } = await verifyUserRole(request, "user");
    if (errorResponse) return errorResponse;

    // 사용자 포인트 정보 조회
    const { data: pointData, error: pointError } = await supabase
      .from("users")
      .select("points")
      .eq("id", user.id)
      .single();

    if (pointError) {
      return NextResponse.json(
        { error: `포인트 정보 조회 오류: ${pointError.message}` },
        { status: 500 },
      );
    }

    // 포인트 거래 내역 조회 (최근 10건)
    const { data: transactionData, error: transactionError } = await supabase
      .from("point_transactions")
      .select(
        `
        id,
        amount,
        transaction_type,
        description,
        created_at,
        blog_post:blog_posts(id, store_name)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (transactionError) {
      return NextResponse.json(
        { error: `거래 내역 조회 오류: ${transactionError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        points: pointData.points,
        transactions: transactionData,
      },
    });
  } catch (error) {
    console.error("포인트 조회 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
