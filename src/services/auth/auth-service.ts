import { supabase } from "@/lib/supabase";

// 현재 세션 정보 조회
export async function getCurrentSession() {
  return await supabase.auth.getSession();
}

// 사용자 역할 정보 조회
export async function getUserRole(userId: string) {
  return await supabase.from("users").select("role").eq("id", userId).single();
}

// 로그인 API 호출
export async function loginUser(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "로그인 중 오류가 발생했습니다");
  }

  if (result.data?.session) {
    await supabase.auth.setSession({
      access_token: result.data.session.access_token,
      refresh_token: result.data.session.refresh_token,
    });
  }

  return result.data;
}

// 회원가입 API 호출
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: string,
) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name, role }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "회원가입 중 오류가 발생했습니다");
  }

  return result.data;
}

// 로그아웃 API 호출
export async function logoutUser() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "로그아웃 중 오류가 발생했습니다");
  }
}

// 인증 상태 변경 리스너 설정
export function setupAuthStateChangeListener(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    callback(session);
  });
}
