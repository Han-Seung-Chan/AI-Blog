export const handleDownloadImage = async (
  imageUrl: string,
  fileName: string,
): Promise<void> => {
  try {
    // fetch를 사용하여 이미지 데이터 가져오기
    const response = await fetch(imageUrl);

    // 응답 상태 확인
    if (!response.ok) {
      throw new Error(`이미지 다운로드 실패: ${response.status}`);
    }

    // 응답을 Blob으로 변환
    const blob = await response.blob();

    // Blob으로부터 URL 생성
    const blobUrl = window.URL.createObjectURL(blob);

    // 다운로드 링크 생성
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName || "blog-image.jpg";

    // 링크 클릭하여 다운로드 시작
    document.body.appendChild(link);
    link.click();

    // 링크 제거 및 URL 객체 해제
    document.body.removeChild(link);
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error("이미지 다운로드 중 오류:", error);
    alert("이미지 다운로드에 실패했습니다. 다시 시도해주세요.");
  }
};
