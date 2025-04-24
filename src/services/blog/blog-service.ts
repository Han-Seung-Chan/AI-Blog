import { getCurrentSession } from "@/services/auth/auth-service";
import {
  ApiResponse,
  CompleteBlogPostRequest,
  ResubmitBlogPostRequest,
} from "@/types/api";
import { BlogPost } from "@/types/blog";
import { BlogImage } from "@/types/image";

interface ErrorWithResponse extends Error {
  response?: Response;
}

export async function getAvailableBlogPosts(): Promise<BlogPost[]> {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch("/api/blog-posts/available", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("작성 가능한 블로그 글 목록을 불러오는데 실패했습니다.");
    }

    const result = (await response.json()) as ApiResponse<BlogPost[]>;
    return result.data as BlogPost[];
  } catch (error) {
    console.error("블로그 글 목록 조회 오류:", error);
    throw error;
  }
}

export async function reserveBlogPost(postId: string): Promise<BlogPost> {
  const {
    data: { session },
  } = await getCurrentSession();
  try {
    const response = await fetch(`/api/blog-posts/${postId}/reserve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "블로그 글 예약에 실패했습니다.");
    }

    const result = (await response.json()) as ApiResponse<BlogPost>;
    return result.data as BlogPost;
  } catch (error) {
    console.error("블로그 글 예약 오류:", error);
    throw error;
  }
}

export async function completeBlogPost(
  postId: string,
  blogUrl: string,
  notes?: string,
): Promise<BlogPost> {
  const {
    data: { session },
  } = await getCurrentSession();
  try {
    const response = await fetch(`/api/blog-posts/${postId}/complete`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        blogUrl,
        completionNotes: notes,
      } as CompleteBlogPostRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(
        errorData.error || "블로그 글 완료 처리에 실패했습니다.",
      );
      (error as ErrorWithResponse).response = response;
      throw error;
    }

    const result = (await response.json()) as ApiResponse<BlogPost>;
    return result.data as BlogPost;
  } catch (error) {
    console.error("블로그 글 완료 처리 오류:", error);
    throw error;
  }
}

export async function cancelReservation(postId: string): Promise<BlogPost> {
  const {
    data: { session },
  } = await getCurrentSession();
  try {
    const response = await fetch(
      `/api/blog-posts/${postId}/cancel-reservation`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "예약 취소에 실패했습니다.");
    }

    const result = (await response.json()) as ApiResponse<BlogPost>;
    return result.data as BlogPost;
  } catch (error) {
    console.error("예약 취소 오류:", error);
    throw error;
  }
}

export async function getMyAssignments(): Promise<BlogPost[]> {
  const {
    data: { session },
  } = await getCurrentSession();
  try {
    const response = await fetch("/api/blog-posts/my-assignments", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("내 블로그 글 목록을 불러오는데 실패했습니다.");
    }

    const result = (await response.json()) as ApiResponse<BlogPost[]>;
    return result.data as BlogPost[];
  } catch (error) {
    console.error("내 블로그 글 목록 조회 오류:", error);
    throw error;
  }
}

export async function resubmitBlogPost(
  postId: string,
  blogUrl: string,
  resubmissionNotes?: string,
): Promise<BlogPost> {
  const {
    data: { session },
  } = await getCurrentSession();
  try {
    const response = await fetch(`/api/blog-posts/${postId}/resubmit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        blogUrl,
        resubmissionNotes,
      } as ResubmitBlogPostRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "블로그 글 재제출에 실패했습니다.");
    }

    const result = (await response.json()) as ApiResponse<BlogPost>;
    return result.data as BlogPost;
  } catch (error) {
    console.error("블로그 글 재제출 오류:", error);
    throw error;
  }
}

// 블로그 포스트의 이미지 목록 조회 함수
export async function getBlogPostImages(postId: string): Promise<BlogImage[]> {
  const {
    data: { session },
  } = await getCurrentSession();

  try {
    const response = await fetch(`/api/blog-posts/${postId}/images`, {
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
