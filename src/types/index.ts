// 아이 프로필 타입
export interface ChildProfile {
  id: string;
  nickname: string;
  age: 4 | 5 | 6; // 레거시 필드 (만 나이)
  birthDate?: string; // YYYY-MM-DD (새로운 기준)
  gender: "male" | "female" | "unknown";
  createdAt: string; // ISO date
}

// 온보딩 기질 응답
export interface TemperamentAnswers {
  newEnvironment: "bold" | "adaptive" | "inhibited";
  fasterThanPeers: string[]; // 다중 선택
  currentObsession: string[]; // 다중 선택
}

// 온보딩 프로필 (기존 검사 포함)
export interface OnboardingProfile {
  child: ChildProfile;
  temperament: TemperamentAnswers;
  hasExistingTest: boolean;
  existingTestNote?: string;
}

// 활동 기록 타입
export type ActivityType = "photo" | "activity" | "question" | "reading" | "emotion";

export interface ActivityRecord {
  id: string;
  type: ActivityType;
  timestamp: string; // ISO datetime
  data: PhotoData | ActivityData | QuestionData | ReadingData | EmotionData;
  isSample?: boolean; // 샘플 데이터 여부
}

export interface PhotoData {
  fileName: string;
  note?: string;
  imageData?: string; // Base64 encoded image
}

export interface ActivityData {
  category: string;
  durationMin: number;
  detail?: string;
}

export interface QuestionData {
  quote: string;
  context?: string;
}

export interface ReadingData {
  bookTitle: string;
  readAlone: boolean;
  durationMin?: number;
}

export interface EmotionData {
  emoji: string;
  label: string;
  note?: string;
}

// 웩슬러 유아 지능검사(K-WPPSI-IV) 기반 5대 영역
export type DomainKey = "verbalComprehension" | "visualSpatial" | "fluidReasoning" | "workingMemory" | "processingSpeed";

export const DOMAIN_LABELS: Record<DomainKey, string> = {
  verbalComprehension: "언어이해",
  visualSpatial: "시공간",
  fluidReasoning: "유동추론",
  workingMemory: "작업기억",
  processingSpeed: "처리속도",
};

// 주간 리포트
export interface WeeklyReport {
  weekLabel: string;
  startDate: string;
  endDate: string;
  scores: Record<DomainKey, number>; // 0~100
  prevScores: Record<DomainKey, number>;
  highlights: string[];
  bands: Record<DomainKey, { band: string; trend: "up" | "stable" | "down" }>;
}

// 추천 활동
export interface RecommendedActivity {
  title: string;
  description: string;
  reason: string;
  domains: string[];
  duration: string;
  icon: string;
}

// 추천 교구
export interface RecommendedProduct {
  name: string;
  price: string;
  reason: string;
  link: string;
  icon: string;
}

// 월간 데이터 포인트
export interface MonthlyDataPoint {
  month: string; // "12월", "1월" ...
  scores: Record<DomainKey, number>;
  predicted?: boolean;
}

// 마일스톤
export interface Milestone {
  id: string;
  title: string;
  icon: string;
  achievedDate: string;
}
