import { BlogPostStatus } from "./blog";

// 활동 유형 정의
export type ActivityAction =
  | "create"
  | "reserve"
  | "cancel_reservation"
  | "complete"
  | "approve"
  | "reject"
  | "resubmit"
  | "upload_images"
  | "delete_image";

export interface ActivityLog {
  id: string;
  user_id: string;
  blog_post_id: string;
  action: ActivityAction;
  status_before: BlogPostStatus | null;
  status_after: BlogPostStatus | null;
  notes: string | null;
  created_at: string;

  // 관계형 데이터
  user?: {
    name: string;
    email: string;
  };
  blog_post?: {
    store_name: string;
  };
}
