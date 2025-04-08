import { GenerationData } from "@/types/workflow";

// 유저 API
export async function getAvailableBlogPosts() {
  try {
    const response = await fetch("/api/blog-posts/available", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("작성 가능한 블로그 글 목록을 불러오는데 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("블로그 글 목록 조회 오류:", error);
    throw error;
  }
}

export async function getMyAssignments() {
  try {
    const response = await fetch("/api/blog-posts/my-assignments", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("내 블로그 글 목록을 불러오는데 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("내 블로그 글 목록 조회 오류:", error);
    throw error;
  }
}

export async function reserveBlogPost(postId: string) {
  try {
    const response = await fetch(`/api/blog-posts/${postId}/reserve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "블로그 글 예약에 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("블로그 글 예약 오류:", error);
    throw error;
  }
}

export async function completeBlogPost(
  postId: string,
  blogUrl: string,
  notes?: string,
) {
  try {
    const response = await fetch(`/api/blog-posts/${postId}/complete`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blogUrl,
        completionNotes: notes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "블로그 글 완료 처리에 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("블로그 글 완료 처리 오류:", error);
    throw error;
  }
}

// 관리자 API
export async function createBlogPost(data: GenerationData, aiContent: string) {
  try {
    const response = await fetch("/api/admin/blog-posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storeName: data.storeName,
        storeURL: data.storeURL,
        mainKeyword: data.mainKeyword,
        subKeywords: [
          data.subKeywords[0] || "",
          data.subKeywords[1] || "",
          data.subKeywords[2] || "",
        ],
        aiContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "블로그 글 생성에 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("블로그 글 생성 오류:", error);
    throw error;
  }
}

export async function getAllBlogPosts(status?: string) {
  try {
    const url = status
      ? `/api/admin/blog-posts?status=${status}`
      : "/api/admin/blog-posts";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("블로그 글 목록을 불러오는데 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("블로그 글 목록 조회 오류:", error);
    throw error;
  }
}

export async function approveBlogPost(postId: string, feedback?: string) {
  try {
    const response = await fetch(`/api/admin/blog-posts/${postId}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminFeedback: feedback,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "블로그 글 승인에 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("블로그 글 승인 오류:", error);
    throw error;
  }
}

// 예약 취소 함수
export async function cancelReservation(postId: string) {
  try {
    const response = await fetch(
      `/api/blog-posts/${postId}/cancel-reservation`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "예약 취소에 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("예약 취소 오류:", error);
    throw error;
  }
}

// 대시보드 통계 조회 함수
export async function getAdminDashboardStats() {
  try {
    const response = await fetch("/api/admin/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("대시보드 통계를 불러오는데 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("대시보드 통계 조회 오류:", error);
    throw error;
  }
}

// 프로필 조회 함수
export async function getUserProfile() {
  try {
    const response = await fetch("/api/users/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("사용자 정보를 불러오는데 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);
    throw error;
  }
}

// 프로필 업데이트 함수
export async function updateUserProfile(data: {
  name?: string;
  profile_image?: string;
}) {
  try {
    const response = await fetch("/api/users/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "프로필 업데이트에 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("프로필 업데이트 오류:", error);
    throw error;
  }
}
