import { NextRequest, NextResponse } from "next/server";

import { verifyUserRole } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

const BLOG_APPROVAL_POINTS = 500; // 블로그 승인 시 지급할 포인트

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const postId = params.id;
    const { adminFeedback } = await request.json();

    const { user, errorResponse } = await verifyUserRole(request, "admin");
    if (errorResponse) return errorResponse;

    // 블로그 글 상태 확인
    const { data: checkData, error: checkError } = await supabase
      .from("blog_posts")
      .select("status, assigned_to")
      .eq("id", postId)
      .single();

    if (checkError) {
      return NextResponse.json(
        { error: `블로그 글을 찾을 수 없습니다.` },
        { status: 404 },
      );
    }

    if (checkData.status !== "completed") {
      return NextResponse.json(
        { error: `이 블로그 글은 완료 상태가 아닙니다.` },
        { status: 400 },
      );
    }

    // 수퍼베이스 트랜잭션 시작
    const { data, error } = await supabase.rpc("approve_blog_with_points", {
      p_post_id: postId,
      p_admin_id: user.id,
      p_admin_feedback: adminFeedback || "",
      p_points_amount: BLOG_APPROVAL_POINTS,
    });

    if (error) {
      return NextResponse.json(
        { error: `승인 처리 오류: ${error.message}` },
        { status: 500 },
      );
    }

    // 승인 후 블로그 포스트 정보 조회
    const { data: postData, error: postError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (postError) {
      return NextResponse.json(
        { error: `승인된 블로그 글 조회 오류: ${postError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: postData });
  } catch (error) {
    console.error("블로그 글 승인 처리 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
