// 상태별 스타일 및 텍스트 매핑
const STATUS_MAPPINGS = {
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
 * @param {string} status - 상태 코드
 * @param {string} type - 상태 타입 ('user' 또는 'admin')
 * @returns {string} 상태에 해당하는 CSS 클래스
 */
export const getStatusClass = (status, type) => {
  const mapping = STATUS_MAPPINGS[type] || {};
  const statusInfo = mapping[status] || {};
  return statusInfo.class || "";
};

/**
 * 상태에 따른 표시 텍스트를 반환합니다
 * @param {string} status - 상태 코드
 * @param {string} type - 상태 타입 ('user' 또는 'admin')
 * @returns {string} 상태에 해당하는 표시 텍스트
 */
export const getStatusText = (status, type) => {
  const mapping = STATUS_MAPPINGS[type] || {};
  const statusInfo = mapping[status] || {};
  return statusInfo.text || status;
};
