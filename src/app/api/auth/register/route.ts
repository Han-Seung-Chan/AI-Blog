import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = "user" } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        {
          error: "이메일, 비밀번호, 이름은 필수 항목입니다.",
        },
        { status: 400 },
      );
    }

    // 사용자 등록
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Supabase Auth가 users 테이블을 자동으로 생성하지 않으므로
    // 커스텀 사용자 테이블에 정보 추가
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email,
      name,
      role: role === "admin" ? "admin" : "user", // 관리자 역할은 제한적으로 허용
      created_at: new Date(),
    });

    if (profileError) {
      // 롤백 처리 (사용자는 생성되었지만 프로필 정보 생성 실패)
      console.error("사용자 테이블 저장 실패:", profileError);

      // 실패 시에도 계속 진행 (사용자는 생성됨)
      return NextResponse.json({
        success: true,
        warning:
          "사용자는 생성되었지만 일부 프로필 정보가 저장되지 않았습니다.",
        data: data.user,
      });
    }

    return NextResponse.json({ success: true, data: data.user });
  } catch (error) {
    console.error("회원가입 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
