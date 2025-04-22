import { getCurrentSession } from "@/services/auth/auth-service";
import { ApiResponse } from "@/types/api";
import { PointResponse } from "@/types/points";

export async function getUserPoints(): Promise<PointResponse> {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch("/api/users/points", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("포인트 정보를 불러오는데 실패했습니다.");
    }

    const result = (await response.json()) as ApiResponse<PointResponse>;
    return result.data as PointResponse;
  } catch (error) {
    console.error("포인트 정보 조회 오류:", error);
    throw error;
  }
}

// 사용자의 일일 작업 횟수 조회
export async function getUserDailyWorkCount(): Promise<any> {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch("/api/users/daily-work-count", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("작업 횟수 정보를 불러오는데 실패했습니다.");
    }

    const result = (await response.json()) as ApiResponse<any>;
    return result.data;
  } catch (error) {
    console.error("작업 횟수 정보 조회 오류:", error);
    throw error;
  }
}
