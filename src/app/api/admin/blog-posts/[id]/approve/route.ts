import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const postId = params.id;
    const { adminFeedback } = await request.json();

    // 인증 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "인증되지 않았습니다." },
        { status: 401 },
      );
    }

    // 관리자 권한 확인
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (userError || userData?.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

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

    // 블로그 글 승인 처리
    const { data, error } = await supabase
      .from("blog_posts")
      .update({
        status: "approved",
        admin_feedback: adminFeedback,
        approved_by: session.user.id,
        approved_at: new Date(),
        updated_at: new Date(),
      })
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `승인 처리 오류: ${error.message}` },
        { status: 500 },
      );
    }

    // 활동 로그 기록
    await supabase.from("activity_logs").insert({
      user_id: session.user.id,
      blog_post_id: postId,
      action: "approve",
      status_before: "completed",
      status_after: "approved",
      notes: adminFeedback || "관리자가 블로그 글 승인",
      created_at: new Date(),
    });

    return NextResponse.json({ success: true, data });
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
