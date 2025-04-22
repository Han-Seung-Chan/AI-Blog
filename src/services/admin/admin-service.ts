import { getCurrentSession } from "@/services/auth/auth-service";
import {
  ApiResponse,
  ApproveBlogPostRequest,
  CreateBlogPostRequest,
  DashboardStats,
  RejectBlogPostRequest,
} from "@/types/api";
import { User } from "@/types/auth";
import { BlogPost, BlogPostStatus } from "@/types/blog";
import { BlogImage } from "@/types/image";
import { GenerationData } from "@/types/workflow";

export async function createBlogPost(
  data: GenerationData,
  aiContent: string,
): Promise<BlogPost> {
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
      } as CreateBlogPostRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "블로그 글 생성에 실패했습니다.");
    }

    const result = (await response.json()) as ApiResponse<BlogPost>;
    return result.data as BlogPost;
  } catch (error) {
    console.error("블로그 글 생성 오류:", error);
    throw error;
  }
}

export async function getAllBlogPosts(
  status?: BlogPostStatus,
  userId?: string,
): Promise<BlogPost[]> {
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

    const result = (await response.json()) as ApiResponse<BlogPost[]>;
    return result.data as BlogPost[];
  } catch (error) {
    console.error("블로그 글 목록 조회 오류:", error);
    throw error;
  }
}

export async function getMyBlogPosts(
  status?: BlogPostStatus,
): Promise<BlogPost[]> {
  return getAllBlogPosts(status, "me");
}

export async function approveBlogPost(
  postId: string,
  feedback?: string,
): Promise<BlogPost> {
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
      } as ApproveBlogPostRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "블로그 글 승인에 실패했습니다.");
    }

    const result = (await response.json()) as ApiResponse<BlogPost>;
    return result.data as BlogPost;
  } catch (error) {
    console.error("블로그 글 승인 오류:", error);
    throw error;
  }
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
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

    const result = (await response.json()) as ApiResponse<DashboardStats>;
    return result.data as DashboardStats;
  } catch (error) {
    console.error("대시보드 통계 조회 오류:", error);
    throw error;
  }
}

// 이미지 업로드 함수
export async function uploadBlogPostImages(
  postId: string,
  formData: FormData,
): Promise<BlogImage[]> {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch(`/api/admin/blog-posts/${postId}/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "이미지 업로드에 실패했습니다.");
    }

    const result = (await response.json()) as ApiResponse<BlogImage[]>;
    return result.data as BlogImage[]; // 업로드된 이미지 정보 배열 반환
  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    throw error;
  }
}

// 이미지 삭제 함수
export async function deleteBlogPostImage(
  postId: string,
  imageId: string,
): Promise<void> {
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

    await response.json();
  } catch (error) {
    console.error("이미지 삭제 오류:", error);
    throw error;
  }
}

export async function rejectBlogPost(
  postId: string,
  rejectionReason: string,
): Promise<BlogPost> {
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
      } as RejectBlogPostRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "블로그 글 거절에 실패했습니다.");
    }

    const result = (await response.json()) as ApiResponse<BlogPost>;
    return result.data as BlogPost;
  } catch (error) {
    console.error("블로그 글 거절 오류:", error);
    throw error;
  }
}

// 블로그 포스트의 이미지 목록 조회 함수
export async function getBlogPostImages(postId: string): Promise<BlogImage[]> {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch(`/api/admin/blog-posts/${postId}/images`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "이미지 목록을 가져오는데 실패했습니다.",
      );
    }

    const result = (await response.json()) as ApiResponse<BlogImage[]>;
    return (result.data as BlogImage[]) || [];
  } catch (error) {
    console.error("이미지 목록 조회 오류:", error);
    throw error;
  }
}

export async function getAllUsers(): Promise<User[]> {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch("/api/admin/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("사용자 목록을 불러오는데 실패했습니다.");
    }

    const result = (await response.json()) as ApiResponse<User[]>;
    return result.data as User[];
  } catch (error) {
    console.error("사용자 목록 조회 오류:", error);
    throw error;
  }
}

export async function updateUserApprovalPoints(
  userId: string,
  points: number,
): Promise<User> {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ blog_approval_points: points }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "사용자 정보 업데이트에 실패했습니다.",
      );
    }

    const result = (await response.json()) as ApiResponse<User>;
    return result.data as User;
  } catch (error) {
    console.error("사용자 정보 업데이트 오류:", error);
    throw error;
  }
}
