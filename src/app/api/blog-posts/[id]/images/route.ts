import { NextRequest, NextResponse } from "next/server";

import { verifyUserRole } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

// 블로그 글에 연결된 모든 이미지 조회
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const postId = params.id;

    // 관리자 권한 확인
    const { errorResponse } = await verifyUserRole(request, "user");
    if (errorResponse) return errorResponse;

    // 이미지 목록 조회
    const { data, error } = await supabase
      .from("blog_images")
      .select("*")
      .eq("blog_post_id", postId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `이미지 목록 조회 오류: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("이미지 목록 조회 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 },
    );
  }
}
