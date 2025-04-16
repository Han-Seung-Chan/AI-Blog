import { BlogPostStatus } from "@/types/blog";

// 상태별 스타일 및 텍스트 매핑
interface StatusInfo {
  class: string;
  text: string;
}

type UserType = "user" | "admin";

interface StatusMappings {
  [key: string]: {
    [key in BlogPostStatus]?: StatusInfo;
  };
}

const STATUS_MAPPINGS: StatusMappings = {
  user: {
    reserved: { class: "text-yellow-500", text: "작성 중" },
    completed: { class: "text-green-500", text: "검수 중" },
    approved: { class: "text-blue-500", text: "승인됨" },
    rejected: { class: "text-destructive", text: "거절됨" },
  },
  admin: {
    created: { class: "text-blue-500", text: "미예약" },
    reserved: { class: "text-yellow-500", text: "예약됨" },
    completed: { class: "text-orange-500", text: "완료 대기" },
    approved: { class: "text-green-500", text: "승인됨" },
    rejected: { class: "text-amber-500", text: "수정 대기" },
  },
};

/**
 * 상태에 따른 스타일 클래스를 반환합니다
 * @param {BlogPostStatus} status - 상태 코드
 * @param {UserType} type - 상태 타입 ('user' 또는 'admin')
 * @returns {string} 상태에 해당하는 CSS 클래스
 */
export const getStatusClass = (
  status: BlogPostStatus,
  type: UserType,
): string => {
  const mapping = STATUS_MAPPINGS[type] || {};
  // 옵셔널 체이닝 연산자(?.)를 사용하여 안전하게 접근
  return mapping[status]?.class || "";
};

/**
 * 상태에 따른 표시 텍스트를 반환합니다
 * @param {BlogPostStatus} status - 상태 코드
 * @param {UserType} type - 상태 타입 ('user' 또는 'admin')
 * @returns {string} 상태에 해당하는 표시 텍스트
 */
export const getStatusText = (
  status: BlogPostStatus,
  type: UserType,
): string => {
  const mapping = STATUS_MAPPINGS[type] || {};
  // 마찬가지로 옵셔널 체이닝 사용
  return mapping[status]?.text || String(status);
};
