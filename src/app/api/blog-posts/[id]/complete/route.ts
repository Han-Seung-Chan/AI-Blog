import { NextRequest, NextResponse } from "next/server";

import { verifyUserRole } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const postId = params.id;
    const { blogUrl, completionNotes } = await request.json();

    if (!blogUrl || blogUrl.trim() === "") {
      return NextResponse.json(
        { error: "블로그 URL은 필수 항목입니다." },
        { status: 400 },
      );
    }

    const { user, errorResponse } = await verifyUserRole(request, "user");
    if (errorResponse) return errorResponse;

    // 일일 작업 제한 확인
    const { data: limitData, error: limitError } = await supabase.rpc(
      "increment_daily_work_count",
      {
        p_user_id: user.id,
      },
    );

    if (limitError) {
      return NextResponse.json(
        { error: `작업 제한 확인 오류: ${limitError.message}` },
        { status: 500 },
      );
    }

    // 작업 한도에 도달한 경우
    if (!limitData.success) {
      return NextResponse.json({ error: limitData.message }, { status: 429 });
    }

    // 블로그 글 상태 확인 (내가 예약한 글인지)
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

    if (checkData.status !== "reserved" || checkData.assigned_to !== user.id) {
      return NextResponse.json(
        { error: `이 블로그 글에 대한 권한이 없습니다.` },
        { status: 403 },
      );
    }

    // 블로그 글 완료 처리
    const { data, error } = await supabase
      .from("blog_posts")
      .update({
        status: "completed",
        blog_url: blogUrl,
        completion_notes: completionNotes,
        completed_at: new Date(),
        updated_at: new Date(),
      })
      .eq("id", postId)
      .eq("assigned_to", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `완료 처리 오류: ${error.message}` },
        { status: 500 },
      );
    }

    // 활동 로그 기록
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      blog_post_id: postId,
      action: "complete",
      status_before: "reserved",
      status_after: "completed",
      notes: completionNotes || "블로그 작성 완료",
      created_at: new Date(),
    });

    return NextResponse.json({
      success: true,
      data,
      workCount: {
        current: limitData.current_count,
        max: limitData.max_count,
        remaining: limitData.remaining_count,
      },
    });
  } catch (error) {
    console.error("완료 처리 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
