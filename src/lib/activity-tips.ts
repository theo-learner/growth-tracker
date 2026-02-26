import { ActivityType } from "@/types";

export interface ActivityTip {
  tip: string;
  nextActivity: {
    title: string;
    description: string;
    icon: string;
  };
}

/** 활동 카테고리별 팁 */
const CATEGORY_TIPS: Record<string, ActivityTip> = {
  퍼즐: {
    tip: "퍼즐을 완성하면서 시공간 능력과 집중력이 자랐어요!",
    nextActivity: { title: "블록 쌓기 도전", description: "퍼즐 다음엔 3D 구성 활동이 시너지를 내요", icon: "🏗️" },
  },
  블록: {
    tip: "입체적으로 생각하는 힘이 길러지고 있어요!",
    nextActivity: { title: "완성 작품 사진 찍기", description: "사진으로 남기면 성취감이 배가 돼요", icon: "📸" },
  },
  학습: {
    tip: "수 개념과 논리적 사고가 쑥쑥 자라고 있어요!",
    nextActivity: { title: "오늘 배운 것 질문하기", description: "'제일 재미있었던 건 뭐야?' 물어보세요", icon: "💬" },
  },
  미술: {
    tip: "창의적 표현은 언어 이전의 훌륭한 소통이에요!",
    nextActivity: { title: "작품 이야기 나누기", description: "그림에 대해 아이에게 설명 부탁해보세요", icon: "🗣️" },
  },
  운동: {
    tip: "신체 활동이 뇌 발달에도 긍정적인 영향을 줘요!",
    nextActivity: { title: "감정 기록하기", description: "운동 후 아이 기분이 어떤지 체크해봐요", icon: "😊" },
  },
};

/** 활동 타입별 기본 팁 */
const TYPE_TIPS: Record<ActivityType, ActivityTip> = {
  photo: {
    tip: "사진은 아이의 관찰력을 보여주는 훌륭한 기록이에요!",
    nextActivity: { title: "사진 이야기 나누기", description: "사진을 보며 '이게 뭐야?' 질문해보세요", icon: "💬" },
  },
  activity: {
    tip: "꾸준한 활동 기록이 발달의 큰 그림을 만들어가요!",
    nextActivity: { title: "오늘 감정 기록하기", description: "활동 후 아이 기분을 체크해봐요", icon: "😊" },
  },
  question: {
    tip: "질문은 유동추론 능력의 가장 확실한 지표예요! 뇌가 열심히 일하고 있어요.",
    nextActivity: { title: "관련 그림책 읽기", description: "질문과 관련된 책을 찾아 함께 읽어봐요", icon: "📚" },
  },
  reading: {
    tip: "독서는 언어이해와 작업기억을 동시에 키워요! 계속 이대로 해주세요.",
    nextActivity: { title: "책 내용으로 대화하기", description: "'제일 좋았던 장면은?' 물어봐요", icon: "💬" },
  },
  emotion: {
    tip: "감정을 표현하는 것 자체가 중요한 사회·정서 발달이에요!",
    nextActivity: { title: "오늘 있었던 활동 기록", description: "어떤 활동이 그 감정을 만들었는지 기록해봐요", icon: "⏱️" },
  },
};

/** 활동 타입/카테고리 → 팁 반환 */
export function getActivityTip(type: ActivityType, category?: string): ActivityTip {
  if (category && CATEGORY_TIPS[category]) {
    return CATEGORY_TIPS[category];
  }
  return TYPE_TIPS[type];
}
