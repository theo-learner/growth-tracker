/**
 * 샘플 데이터 생성 — 온보딩 완료 시 1주일치 샘플 자동 생성
 * API 키 없이 데모 모드로 완전 동작
 */
import {
  ActivityRecord,
  WeeklyReport,
  RecommendedActivity,
  RecommendedProduct,
  MonthlyDataPoint,
  Milestone,
} from "@/types";

// 오늘 기준으로 날짜 계산 헬퍼
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function todayAt(hour: number, min: number): string {
  const d = new Date();
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

// 1주일치 샘플 활동 기록 생성
export function generateSampleActivities(childName: string): ActivityRecord[] {
  return [
    // 오늘
    {
      id: "act-001",
      type: "activity",
      timestamp: todayAt(14, 30),
      data: { category: "퍼즐", durationMin: 48, detail: `72조각 공룡 퍼즐 — ${childName}가 처음 혼자 완성!` },
    },
    {
      id: "act-002",
      type: "question",
      timestamp: todayAt(11, 20),
      data: { quote: "엄마 왜 달은 낮에도 있어?", context: "산책 중에 갑자기" },
    },
    {
      id: "act-003",
      type: "reading",
      timestamp: todayAt(9, 0),
      data: { bookTitle: "이상한 나라의 앨리스", readAlone: false, durationMin: 30 },
    },
    {
      id: "act-004",
      type: "emotion",
      timestamp: todayAt(19, 0),
      data: { emoji: "😊", label: "행복", note: "퍼즐 완성하고 아주 뿌듯해했어요" },
    },
    // 어제
    {
      id: "act-005",
      type: "activity",
      timestamp: daysAgo(1),
      data: { category: "블록", durationMin: 35, detail: "레고로 우주선 만들기" },
    },
    {
      id: "act-006",
      type: "reading",
      timestamp: daysAgo(1),
      data: { bookTitle: "구름빵", readAlone: true, durationMin: 15 },
    },
    {
      id: "act-007",
      type: "question",
      timestamp: daysAgo(1),
      data: { quote: "왜 비행기는 안 떨어져?", context: "레고 놀이 중" },
    },
    // 2일 전
    {
      id: "act-008",
      type: "activity",
      timestamp: daysAgo(2),
      data: { category: "미술", durationMin: 40, detail: "색연필로 가족 그림 그림" },
    },
    {
      id: "act-009",
      type: "photo",
      timestamp: daysAgo(2),
      data: { fileName: "family_drawing.jpg", note: "가족 그림 완성!" },
    },
    // 3일 전
    {
      id: "act-010",
      type: "activity",
      timestamp: daysAgo(3),
      data: { category: "퍼즐", durationMin: 52, detail: "72조각 동물 퍼즐" },
    },
    {
      id: "act-011",
      type: "reading",
      timestamp: daysAgo(3),
      data: { bookTitle: "수학도둑", readAlone: false, durationMin: 25 },
    },
    // 4일 전
    {
      id: "act-012",
      type: "activity",
      timestamp: daysAgo(4),
      data: { category: "체육", durationMin: 60, detail: "공원에서 자전거 타기" },
    },
    {
      id: "act-013",
      type: "emotion",
      timestamp: daysAgo(4),
      data: { emoji: "😤", label: "짜증", note: "숙제 하기 싫다고 울었어요" },
    },
    // 5일 전
    {
      id: "act-014",
      type: "question",
      timestamp: daysAgo(5),
      data: { quote: "공룡은 왜 없어졌어?", context: "공룡 도감 보면서" },
    },
    {
      id: "act-015",
      type: "activity",
      timestamp: daysAgo(5),
      data: { category: "코딩", durationMin: 30, detail: "스크래치 주니어로 고양이 움직이기" },
    },
    // 6일 전
    {
      id: "act-016",
      type: "reading",
      timestamp: daysAgo(6),
      data: { bookTitle: "어린왕자", readAlone: false, durationMin: 20 },
    },
    {
      id: "act-017",
      type: "activity",
      timestamp: daysAgo(6),
      data: { category: "음악", durationMin: 25, detail: "피아노 연습 — 나비야 완주" },
    },
  ];
}

// 주간 리포트 샘플
export function generateSampleWeeklyReport(_childName: string): WeeklyReport {
  return {
    weekLabel: "2월 1주차",
    startDate: "2026-02-01",
    endDate: "2026-02-07",
    scores: {
      language: 75,
      visuospatial: 82,
      workingMemory: 70,
      processingSpeed: 78,
      logic: 68,
      fineMotor: 72,
    },
    prevScores: {
      language: 72,
      visuospatial: 77,
      workingMemory: 71,
      processingSpeed: 70,
      logic: 66,
      fineMotor: 70,
    },
    highlights: [
      `🧩 퍼즐 시간이 4분 단축됐어요! (52분 → 48분)`,
      `💬 "왜?" 질문이 하루 평균 3회 → 5회로 늘었어요`,
      `📖 이번 주 책 4권 읽었어요!`,
    ],
    bands: {
      language: { band: "상위 15~25%", trend: "up" },
      visuospatial: { band: "상위 10~20%", trend: "up" },
      workingMemory: { band: "상위 25~35%", trend: "stable" },
      processingSpeed: { band: "상위 20~30%", trend: "up" },
      logic: { band: "상위 30~40%", trend: "stable" },
      fineMotor: { band: "상위 20~30%", trend: "up" },
    },
  };
}

// AI 추천 활동 샘플
export function generateSampleRecommendations(_childName: string): RecommendedActivity[] {
  return [
    {
      title: "100조각 퍼즐 도전하기",
      description: `72조각을 48분에 완성했으니, 100조각도 도전해볼 때예요!`,
      reason: "시공간 + 처리속도 향상",
      domains: ["시지각", "처리속도"],
      duration: "50~60분",
      icon: "🧩",
    },
    {
      title: "과학 그림책 함께 읽기",
      description: `달에 대해 궁금해하고 있으니 호기심을 키워줄 수 있어요`,
      reason: "언어 + 논리 향상",
      domains: ["언어", "논리"],
      duration: "20~30분",
      icon: "📖",
    },
    {
      title: "가위로 곡선 오리기",
      description: `소근육이 빠르게 자라고 있어서 한 단계 올려봐요`,
      reason: "소근육 + 집중력 향상",
      domains: ["소근육"],
      duration: "15~20분",
      icon: "✂️",
    },
  ];
}

// 추천 교구 샘플
export function generateSampleProducts(): RecommendedProduct[] {
  return [
    {
      name: "라벤스부르거 100P 동물 퍼즐",
      price: "₩18,900",
      reason: "시공간 능력 강화에 도움돼요",
      link: "https://www.coupang.com",
      icon: "🧩",
    },
    {
      name: "《달에 대해 알려줘》 과학 그림책",
      price: "₩12,600",
      reason: "호기심을 탐구로 연결시켜줘요",
      link: "https://www.coupang.com",
      icon: "📚",
    },
    {
      name: "쿠몬 가위 연습 세트 (곡선 단계)",
      price: "₩9,800",
      reason: "소근육 발달 단계에 딱 맞는 난이도예요",
      link: "https://www.coupang.com",
      icon: "✂️",
    },
  ];
}

// 월간 추이 샘플 (3개월 실제 + 3개월 예측)
export function generateSampleMonthlyData(): MonthlyDataPoint[] {
  return [
    {
      month: "11월",
      scores: { language: 58, visuospatial: 60, workingMemory: 55, processingSpeed: 52, logic: 50, fineMotor: 54 },
    },
    {
      month: "12월",
      scores: { language: 63, visuospatial: 68, workingMemory: 60, processingSpeed: 60, logic: 55, fineMotor: 60 },
    },
    {
      month: "1월",
      scores: { language: 70, visuospatial: 75, workingMemory: 66, processingSpeed: 70, logic: 62, fineMotor: 66 },
    },
    {
      month: "2월",
      scores: { language: 75, visuospatial: 82, workingMemory: 70, processingSpeed: 78, logic: 68, fineMotor: 72 },
    },
    {
      month: "3월",
      predicted: true,
      scores: { language: 79, visuospatial: 86, workingMemory: 73, processingSpeed: 82, logic: 72, fineMotor: 76 },
    },
    {
      month: "4월",
      predicted: true,
      scores: { language: 82, visuospatial: 89, workingMemory: 76, processingSpeed: 85, logic: 75, fineMotor: 79 },
    },
    {
      month: "5월",
      predicted: true,
      scores: { language: 85, visuospatial: 91, workingMemory: 78, processingSpeed: 87, logic: 78, fineMotor: 82 },
    },
  ];
}

// 마일스톤 샘플
export function generateSampleMilestones(): Milestone[] {
  return [
    { id: "ms-1", title: "72조각 퍼즐 혼자 완성!", icon: "🥇", achievedDate: "2026-02-07" },
    { id: "ms-2", title: "\"왜?\" 질문 100회 돌파", icon: "🥈", achievedDate: "2026-01-15" },
    { id: "ms-3", title: "혼자 책 읽기 시작", icon: "🥉", achievedDate: "2025-12-20" },
    { id: "ms-4", title: "7일 연속 기록 달성!", icon: "🌟", achievedDate: "2026-02-05" },
  ];
}

// AI 분석 프리셋 응답 (API 키 없을 때 사용)
export const PRESET_ANALYSIS = {
  dailyInsight: {
    insights: [
      {
        type: "progress" as const,
        icon: "📈",
        message: "퍼즐 완성 시간이 지난주보다 4분 빨라졌어요. 처리 속도가 꾸준히 좋아지고 있어요!",
        domain: "처리속도",
      },
      {
        type: "observation" as const,
        icon: "💡",
        message: '"왜 달은 낮에도 있어?" — 과학적 사고의 시작이에요! 이런 질문을 많이 하면 논리력이 쑥쑥 자라요.',
        domain: "논리",
      },
      {
        type: "encouragement" as const,
        icon: "🌟",
        message: "이번 주 벌써 4번째 기록이에요! 꾸준한 관찰이 아이 성장의 가장 큰 힘이에요.",
        domain: "",
      },
    ],
    todayTip: "오늘은 블록 놀이를 해보세요. 시공간 능력과 처리속도를 동시에 자극할 수 있어요.",
  },
};
