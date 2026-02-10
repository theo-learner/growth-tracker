/**
 * 제휴 마케팅 유틸리티
 */

// 쿠팡 파트너스 딥링크 생성 (검색 결과 페이지로 이동)
// 실제 파트너스 ID가 있다면 channel 파라미터 등을 추가할 수 있습니다.
export function generateCoupangLink(keyword: string): string {
  const encodedKeyword = encodeURIComponent(keyword);
  // 쿠팡 검색 결과 URL (파트너스 트래킹 파라미터 추가 가능 영역)
  // 예시: https://www.coupang.com/np/search?component=&q=KEYWORD&channel=user
  return `https://www.coupang.com/np/search?component=&q=${encodedKeyword}`;
}

export const AFFILIATE_NOTICE = "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";
