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
