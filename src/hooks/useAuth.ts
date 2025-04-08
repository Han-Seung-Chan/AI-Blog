import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentSession,
  getUserRole,
  loginUser,
  registerUser,
  logoutUser,
  setupAuthStateChangeListener,
} from "@/services/auth/auth-service";

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
        } = await getCurrentSession();

        if (session) {
          setUser(session.user);

          const { data: userData } = await getUserRole(session.user.id);
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
    } = setupAuthStateChangeListener(async (session) => {
      if (session) {
        setUser(session.user);

        // 사용자 역할 확인
        const { data: userData } = await getUserRole(session.user.id);
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
      // 서비스 함수 호출로 변경
      const data = await loginUser(email, password);

      // 역할에 따라 리다이렉트
      if (data.user.role === "admin") {
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
      // 서비스 함수 호출로 변경
      await registerUser(email, password, name, role);

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
      // 서비스 함수 호출로 변경
      await logoutUser();
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
