import { getCurrentSession } from "@/services/auth/auth-service";
import { GenerationData } from "@/types/workflow";

export async function createBlogPost(data: GenerationData, aiContent: string) {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch("/api/admin/blog-posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
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

export async function getAllBlogPosts(status?: string, userId?: string) {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    let url = "/api/admin/blog-posts";
    const params = new URLSearchParams();

    if (status) {
      params.append("status", status);
    }

    if (userId) {
      params.append("userId", userId);
    }

    // 쿼리 파라미터가 있으면 URL에 추가
    const queryString = params.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
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

export async function getMyBlogPosts(status?: string) {
  return getAllBlogPosts(status, "me");
}

export async function approveBlogPost(postId: string, feedback?: string) {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch(`/api/admin/blog-posts/${postId}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
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

// 이미지 업로드 함수
export async function uploadBlogPostImages(postId: string, formData: FormData) {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch(`/api/admin/blog-posts/${postId}/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData, // FormData는 Content-Type을 자동으로 설정
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "이미지 업로드에 실패했습니다.");
    }

    const result = await response.json();
    return result.data; // 업로드된 이미지 정보 배열 반환
  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    throw error;
  }
}

// 이미지 삭제 함수
export async function deleteBlogPostImage(postId: string, imageId: string) {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch(
      `/api/admin/blog-posts/${postId}/images/${imageId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "이미지 삭제에 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("이미지 삭제 오류:", error);
    throw error;
  }
}

export async function rejectBlogPost(postId: string, rejectionReason: string) {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch(`/api/admin/blog-posts/${postId}/reject`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        rejectionReason,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "블로그 글 거절에 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("블로그 글 거절 오류:", error);
    throw error;
  }
}
