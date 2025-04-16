import { ActivityLog } from "./activity";

// API 응답 기본 구조
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 블로그 게시물 생성 요청
export interface CreateBlogPostRequest {
  storeName: string;
  storeURL: string;
  mainKeyword: string;
  subKeywords: string[];
  aiContent: string;
}

// 블로그 완료 요청
export interface CompleteBlogPostRequest {
  blogUrl: string;
  completionNotes?: string;
}

// 블로그 재제출 요청
export interface ResubmitBlogPostRequest {
  blogUrl: string;
  resubmissionNotes?: string;
}

// 블로그 승인 요청
export interface ApproveBlogPostRequest {
  adminFeedback?: string;
}

// 블로그 거절 요청
export interface RejectBlogPostRequest {
  rejectionReason: string;
}

// 대시보드 통계 응답
export interface DashboardStats {
  posts: {
    total: number;
    created: number;
    reserved: number;
    completed: number;
    approved: number;
  };
  users: {
    total: number;
    admins: number;
    regularUsers: number;
  };
  recentActivity: ActivityLog[];
}
