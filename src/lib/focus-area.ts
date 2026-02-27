import { DomainKey, WeeklyReport } from "@/types";

const DOMAIN_LABELS: Record<DomainKey, string> = {
  verbalComprehension: "언어이해",
  visualSpatial: "시공간",
  fluidReasoning: "유동추론",
  workingMemory: "작업기억",
  processingSpeed: "처리속도",
};

export interface FreePlayIdea {
  title: string;
  description: string;
  duration: string;
  icon: string;
}

export interface FocusArea {
  domain: DomainKey;
  label: string;
  score: number;
  explanation: string;
  freePlayIdeas: FreePlayIdea[];
}

const DOMAIN_CONTEXT: Record<DomainKey, { explanation: string; freePlayIdeas: FreePlayIdea[] }> = {
  verbalComprehension: {
    explanation: "언어이해는 어휘력, 이해력, 표현력의 기초예요. 일상 대화가 가장 좋은 훈련이에요.",
    freePlayIdeas: [
      { title: "끝말잇기 놀이", description: "아이와 번갈아 끝말잇기를 해보세요", duration: "10분", icon: "💬" },
      { title: "오늘 있었던 일 이야기하기", description: "저녁 식사 때 하루를 3문장으로 말해봐요", duration: "15분", icon: "🗣️" },
      { title: "'왜' 대화 놀이", description: "아이 질문에 함께 답을 찾아보세요", duration: "10분", icon: "❓" },
    ],
  },
  visualSpatial: {
    explanation: "시공간 능력은 도형 인식, 공간 관계, 구성 능력이에요. 블록과 퍼즐이 핵심이에요.",
    freePlayIdeas: [
      { title: "종이접기", description: "색종이로 배, 비행기, 개구리 만들기", duration: "15분", icon: "🦢" },
      { title: "그림자 놀이", description: "손으로 벽에 동물 그림자 만들기", duration: "10분", icon: "🖐️" },
      { title: "보물찾기", description: "집 안에 물건 숨기고 단서 노트 만들기", duration: "20분", icon: "🗺️" },
    ],
  },
  fluidReasoning: {
    explanation: "유동추론은 새로운 문제를 해결하는 능력이에요. '왜?' 질문이 많으면 좋은 신호예요.",
    freePlayIdeas: [
      { title: "숫자 패턴 놀이", description: "1, 2, ?, 4 — 빈칸 맞추기 게임", duration: "10분", icon: "🔢" },
      { title: "왜-왜-왜 대화", description: "아이 질문에 '그럼 왜 그럴까?' 되물어보기", duration: "10분", icon: "🤔" },
      { title: "장난감 분류 놀이", description: "색깔/크기/종류로 분류하고 이유 말하기", duration: "15분", icon: "📦" },
    ],
  },
  workingMemory: {
    explanation: "작업기억은 정보를 머리에 유지하며 처리하는 능력이에요. 일상 속 기억 게임이 도움돼요.",
    freePlayIdeas: [
      { title: "기억력 카드 놀이", description: "카드를 뒤집어 짝 맞추기", duration: "15분", icon: "🃏" },
      { title: "장보기 기억 놀이", description: "3~5가지 물건을 기억해서 가져오기", duration: "10분", icon: "🛒" },
      { title: "노래 새 구절 외우기", description: "좋아하는 노래 가사 한 절 외워보기", duration: "10분", icon: "🎵" },
    ],
  },
  processingSpeed: {
    explanation: "처리속도는 빠르고 정확하게 과제를 수행하는 능력이에요. 반복 연습이 효과적이에요.",
    freePlayIdeas: [
      { title: "빨리 옷 입기 게임", description: "타이머 맞춰놓고 옷 입기 경주", duration: "5분", icon: "👕" },
      { title: "색칠하기", description: "선 안에 빠르게 깔끔하게 색칠하기", duration: "15분", icon: "🖍️" },
      { title: "정리정돈 경주", description: "장난감 누가 빨리 정리하나 내기", duration: "10분", icon: "🏁" },
    ],
  },
};

/** 주간 리포트에서 가장 집중이 필요한 영역 반환 */
export function getFocusArea(report: WeeklyReport): FocusArea | null {
  const entries = Object.entries(report.scores) as [DomainKey, number][];
  if (entries.length === 0) return null;
  const [lowestDomain, lowestScore] = entries.reduce(
    (min, curr) => (curr[1] < min[1] ? curr : min)
  );
  const context = DOMAIN_CONTEXT[lowestDomain];
  if (!context) return null;
  return {
    domain: lowestDomain,
    label: DOMAIN_LABELS[lowestDomain],
    score: lowestScore,
    explanation: context.explanation,
    freePlayIdeas: context.freePlayIdeas,
  };
}
