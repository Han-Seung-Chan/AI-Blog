import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 인증 세션 확인
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "인증되지 않았습니다." },
        { status: 401 },
      );
    }

    // 내가 작업 중인 블로그 글 목록 조회
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `
        *,
        assigned_user:users!assigned_to(name, email)
      `,
      )
      .eq("assigned_to", session.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `블로그 글 조회 오류: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("내 블로그 글 목록 조회 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
