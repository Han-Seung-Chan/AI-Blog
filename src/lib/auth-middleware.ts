import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

export async function verifyUserRole(
  request: NextRequest,
  requiredRole: string = "admin",
) {
  // 인증 토큰 확인
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "인증되지 않았습니다." },
        { status: 401 },
      ),
    };
  }

  // 토큰으로 사용자 확인
  const token = authHeader.split(" ")[1];
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "유효하지 않은 토큰입니다." },
        { status: 401 },
      ),
    };
  }

  // 역할 확인
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "사용자 정보를 확인할 수 없습니다." },
        { status: 500 },
      ),
    };
  }

  if (userData.role !== requiredRole) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 },
      ),
    };
  }

  return {
    user,
    errorResponse: null,
  };
}
