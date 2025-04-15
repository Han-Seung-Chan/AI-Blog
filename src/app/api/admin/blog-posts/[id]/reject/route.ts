import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { verifyUserRole } from "@/lib/auth-middleware";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const postId = params.id;
    const { rejectionReason } = await request.json();

    if (!rejectionReason || rejectionReason.trim() === "") {
      return NextResponse.json(
        { error: "거절 사유는 필수 항목입니다." },
        { status: 400 },
      );
    }

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

    // 블로그 글 거절 처리
    const { data, error } = await supabase
      .from("blog_posts")
      .update({
        status: "rejected",
        rejection_reason: rejectionReason,
        rejected_by: user.id,
        rejected_at: new Date(),
        updated_at: new Date(),
      })
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `거절 처리 오류: ${error.message}` },
        { status: 500 },
      );
    }

    // 활동 로그 기록
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      blog_post_id: postId,
      action: "reject",
      status_before: "completed",
      status_after: "rejected",
      notes: `거절 사유: ${rejectionReason}`,
      created_at: new Date(),
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("블로그 글 거절 처리 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
