import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const postId = params.id;

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

    if (
      checkData.status !== "reserved" ||
      checkData.assigned_to !== session.user.id
    ) {
      return NextResponse.json(
        { error: `이 블로그 글에 대한 권한이 없습니다.` },
        { status: 403 },
      );
    }

    // 블로그 글 예약 취소 처리
    const { data, error } = await supabase
      .from("blog_posts")
      .update({
        status: "created",
        assigned_to: null,
        reserved_at: null,
        updated_at: new Date(),
      })
      .eq("id", postId)
      .eq("assigned_to", session.user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `예약 취소 처리 오류: ${error.message}` },
        { status: 500 },
      );
    }

    // 활동 로그 기록
    await supabase.from("activity_logs").insert({
      user_id: session.user.id,
      blog_post_id: postId,
      action: "cancel_reservation",
      status_before: "reserved",
      status_after: "created",
      notes: "유저 예약 취소",
      created_at: new Date(),
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("예약 취소 처리 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
