/**
 * API 클라이언트 유틸리티
 * 웹/앱 환경에 따라 적절한 API 엔드포인트를 선택합니다.
 */

// Vercel 배포 URL (환경변수 또는 하드코딩)
// 실제 배포 후 도메인이 나오면 여기를 수정해야 합니다.
// 현재는 임시로 theo-learner의 Vercel URL 패턴을 가정하거나 localhost를 사용합니다.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""; 

export async function callApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response.json();
}
