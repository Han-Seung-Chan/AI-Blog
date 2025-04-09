import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 인증 확인
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

    // 작성 가능한 블로그 글 목록 조회 (status가 'created'인 것들)
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "created")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `블로그 글 조회 오류: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("작성 가능한 블로그 글 목록 조회 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
