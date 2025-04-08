import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // 사용자 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log(session);

        if (session) {
          // 사용자 정보 설정
          setUser(session.user);

          // 사용자 역할 확인
          const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();

          setIsAdmin(userData?.role === "admin");
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("세션 확인 중 오류:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);

        // 사용자 역할 확인
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setIsAdmin(userData?.role === "admin");
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 로그인 함수
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");
    try {
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

      const userData = result.data.user;

      // 역할에 따라 리다이렉트
      if (userData.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "로그인 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 함수
  const register = async (
    email: string,
    password: string,
    name: string,
    role: string,
  ) => {
    setIsLoading(true);
    setError("");
    try {
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

      // 자동 로그인 (회원가입 후)
      await login(email, password);
    } catch (err) {
      setError(err.message || "회원가입 중 오류가 발생했습니다");
      setIsLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      router.push("/login");
    } catch (err) {
      setError("로그아웃 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAdmin,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
