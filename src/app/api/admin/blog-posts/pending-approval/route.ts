import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
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

    // 승인 대기 중인 블로그 글 목록
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `
        *,
        assigned_user:users!assigned_to(name, email)
      `,
      )
      .eq("status", "completed")
      .order("completed_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `블로그 글 조회 오류: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("승인 대기 글 조회 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
