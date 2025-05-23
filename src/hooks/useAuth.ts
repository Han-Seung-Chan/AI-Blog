import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getCurrentSession,
  getUserRole,
  loginUser,
  logoutUser,
  registerUser,
  setupAuthStateChangeListener,
} from "@/services/auth/auth-service";
import { User, UserRegisterData } from "@/types/auth";
interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserRegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthState {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // 사용자 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);

        const {
          data: { session },
        } = await getCurrentSession();

        if (session) {
          setUser(session.user as User);

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
        setUser(session.user as User);

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

  // 회원가입 함수 - 수정됨
  const register = async (userData: UserRegisterData) => {
    setIsLoading(true);
    setError("");
    try {
      await registerUser(userData);
      // 자동 로그인 (회원가입 후)
      await login(userData.email, userData.password);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      router.push("/login");
    } catch {
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
