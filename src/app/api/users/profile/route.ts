import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUserRole } from "@/lib/auth-middleware";

// 현재 사용자 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse } = await verifyUserRole(request, "user");
    if (errorResponse) return errorResponse;

    // 사용자 정보 조회 (포인트 필드 포함)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*, points")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: `사용자 정보 조회 오류: ${userError.message}` },
        { status: 500 },
      );
    }

    // 비밀번호 등 민감 정보 제거
    if (userData) {
      delete userData.password;
    }

    return NextResponse.json({ success: true, data: userData });
  } catch (error) {
    console.error("프로필 조회 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}

// 사용자 프로필 업데이트
export async function PUT(request: NextRequest) {
  try {
    const updateData = await request.json();

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

    // 업데이트 가능한 필드만 허용
    const allowedFields = ["name", "profile_image"];
    const filteredData = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    // 사용자 정보 업데이트
    const { data, error } = await supabase
      .from("users")
      .update(filteredData)
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `프로필 업데이트 오류: ${error.message}` },
        { status: 500 },
      );
    }

    // 비밀번호 등 민감 정보 제거
    if (data) {
      delete data.password;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("프로필 업데이트 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
