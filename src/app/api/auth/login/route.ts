import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "이메일과 비밀번호는 필수 항목입니다.",
        },
        { status: 400 },
      );
    }

    // 로그인 처리
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 사용자 정보 추가 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, name")
      .eq("id", data.user.id)
      .single();

    if (userError) {
      console.error("사용자 정보 조회 실패:", userError);
      // 로그인은 성공했으므로 계속 진행
    }

    // 응답에 사용자 정보 추가
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        user: {
          ...data.user,
          role: userData?.role || "user",
          name: userData?.name || "",
        },
      },
    });
  } catch (error) {
    console.error("로그인 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
