/**
 * i18n 준비 모듈 — 현재는 한국어만 지원
 * 향후 다국어 확장 시 이 모듈을 통해 메시지를 관리합니다.
 */

export type Locale = "ko" | "en";

export const DEFAULT_LOCALE: Locale = "ko";
export const SUPPORTED_LOCALES: Locale[] = ["ko"];

// 공통 UI 메시지
const messages: Record<Locale, Record<string, string>> = {
  ko: {
    "app.title": "🌱 AI 성장 트래커",
    "app.description": "매일 2분의 기록으로, 우리 아이 발달의 큰 그림을 그리다",
    "nav.home": "홈",
    "nav.report": "리포트",
    "nav.recommend": "추천",
    "nav.monthly": "월간",
    "nav.guide": "가이드",
    "common.loading": "로딩 중...",
    "common.retry": "다시 시도",
    "common.save": "저장",
    "common.cancel": "취소",
    "common.delete": "삭제",
    "common.confirm": "확인",
    "error.generic": "문제가 발생했어요",
    "error.tryAgain": "잠시 후 다시 시도해 주세요.",
    "error.notFound": "페이지를 찾을 수 없어요",
    "error.goHome": "홈으로 돌아가기",
  },
  en: {
    "app.title": "🌱 AI Growth Tracker",
    "app.description": "Track your child's development with just 2 minutes a day",
    "nav.home": "Home",
    "nav.report": "Report",
    "nav.recommend": "Recommend",
    "nav.monthly": "Monthly",
    "nav.guide": "Guide",
    "common.loading": "Loading...",
    "common.retry": "Retry",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.confirm": "OK",
    "error.generic": "Something went wrong",
    "error.tryAgain": "Please try again later.",
    "error.notFound": "Page not found",
    "error.goHome": "Go Home",
  },
};

let currentLocale: Locale = DEFAULT_LOCALE;

export function setLocale(locale: Locale): void {
  if (SUPPORTED_LOCALES.includes(locale)) {
    currentLocale = locale;
  }
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, locale?: Locale): string {
  const l = locale || currentLocale;
  return messages[l]?.[key] || messages[DEFAULT_LOCALE]?.[key] || key;
}
