// 블로그 포스트 상태 타입
export type BlogPostStatus =
  | "created"
  | "reserved"
  | "completed"
  | "approved"
  | "rejected";

// 블로그 포스트 인터페이스
export interface BlogPost {
  id: string;
  store_name: string;
  store_url: string | null;
  main_keyword: string;
  sub_keyword1: string | null;
  sub_keyword2: string | null;
  sub_keyword3: string | null;
  ai_content: string;
  blog_url: string | null;
  status: BlogPostStatus;
  has_images: boolean;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  completion_notes: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  resubmission_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  admin_feedback: string | null;
  reserved_at: string | null;

  // 관계형 데이터
  assigned_user?: {
    name: string;
    email: string;
  };
}

export interface BlogTableColumn {
  key: string;
  title: string;
  render?: (post: BlogPost) => React.ReactNode;
}
