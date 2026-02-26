import { DomainKey } from "@/types";

export type InterpretationLevel = "good" | "normal" | "attention";

export interface DomainInterpretation {
  level: InterpretationLevel;
  emoji: string;
  message: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

/** 점수 → 안심/보통/관심 해석 */
export function interpretScore(score: number): DomainInterpretation {
  if (score >= 70) {
    return {
      level: "good",
      emoji: "✅",
      message: "잘 하고 있어요",
      bgColor: "bg-primary-50",
      textColor: "text-primary-700",
      borderColor: "border-primary-100",
    };
  }
  if (score >= 60) {
    return {
      level: "normal",
      emoji: "⚡",
      message: "집중해 볼까요",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-100",
    };
  }
  return {
    level: "attention",
    emoji: "⚠️",
    message: "관심 필요",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
    borderColor: "border-rose-100",
  };
}

/** 전체 점수 맵 → 종합 상태 한줄 */
export function getOverallSummary(scores: Record<DomainKey, number>): {
  level: InterpretationLevel;
  emoji: string;
  message: string;
} {
  const values = Object.values(scores);
  const attentionCount = values.filter((v) => v < 60).length;
  const goodCount = values.filter((v) => v >= 70).length;

  if (attentionCount === 0 && goodCount >= 3) {
    return { level: "good", emoji: "😊", message: "전반적으로 잘 성장하고 있어요!" };
  }
  if (attentionCount >= 2) {
    return { level: "attention", emoji: "🤗", message: "몇 가지 영역에 함께 관심 가져봐요" };
  }
  return { level: "normal", emoji: "💪", message: "고르게 발달하고 있어요, 조금만 더!" };
}
