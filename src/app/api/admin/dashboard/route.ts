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

    // 블로그 글 통계
    const { data: blogPosts, error: blogError } = await supabase
      .from("blog_posts")
      .select("status")
      .order("created_at", { ascending: false });

    if (blogError) {
      return NextResponse.json(
        { error: `통계 정보 조회 오류: ${blogError.message}` },
        { status: 500 },
      );
    }

    // 사용자 통계
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("role")
      .order("created_at", { ascending: false });

    if (usersError) {
      return NextResponse.json(
        { error: `사용자 정보 조회 오류: ${usersError.message}` },
        { status: 500 },
      );
    }

    // 활동 로그 (최근 10개)
    const { data: recentActivity, error: activityError } = await supabase
      .from("activity_logs")
      .select(
        `
        *,
        user:users(name, email),
        blog_post:blog_posts(store_name)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (activityError) {
      return NextResponse.json(
        { error: `활동 로그 조회 오류: ${activityError.message}` },
        { status: 500 },
      );
    }

    // 통계 계산
    const stats = {
      posts: {
        total: blogPosts.length,
        created: blogPosts.filter((post) => post.status === "created").length,
        reserved: blogPosts.filter((post) => post.status === "reserved").length,
        completed: blogPosts.filter((post) => post.status === "completed")
          .length,
        approved: blogPosts.filter((post) => post.status === "approved").length,
      },
      users: {
        total: users.length,
        admins: users.filter((user) => user.role === "admin").length,
        regularUsers: users.filter((user) => user.role === "user").length,
      },
      recentActivity,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("대시보드 정보 조회 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
