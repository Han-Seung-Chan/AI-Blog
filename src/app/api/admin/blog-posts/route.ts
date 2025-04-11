import { NextRequest, NextResponse } from "next/server";

import { verifyUserRole } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

// 블로그 글 생성
export async function POST(request: NextRequest) {
  try {
    const { storeName, storeURL, mainKeyword, subKeywords, aiContent } =
      await request.json();

    const { user, errorResponse } = await verifyUserRole(request, "admin");
    if (errorResponse) return errorResponse;

    // 블로그 글 생성
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        store_name: storeName,
        store_url: storeURL,
        main_keyword: mainKeyword,
        sub_keyword1: subKeywords[0] || null,
        sub_keyword2: subKeywords[1] || null,
        sub_keyword3: subKeywords[2] || null,
        ai_content: aiContent,
        status: "created",
        created_by: user.id,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `블로그 글 생성 오류: ${error.message}` },
        { status: 500 },
      );
    }

    // 활동 로그 기록
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      blog_post_id: data.id,
      action: "create",
      status_before: null,
      status_after: "created",
      notes: "관리자가 블로그 글 생성",
      created_at: new Date(),
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("블로그 글 생성 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}

// 블로그 글 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 가져오기
    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    const { errorResponse } = await verifyUserRole(request, "admin");
    if (errorResponse) return errorResponse;

    // 블로그 글 조회 쿼리 구성
    let query = supabase
      .from("blog_posts")
      .select(`*, assigned_user:users!assigned_to(name, email)`)
      .order("created_at", { ascending: false });

    // 특정 상태로 필터링
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `블로그 글 조회 오류: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("블로그 글 목록 조회 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
