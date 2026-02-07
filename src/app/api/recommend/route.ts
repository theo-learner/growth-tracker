import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/recommend — 맞춤 추천 (Claude API, fallback: 프리셋)
 */

// 프리셋 추천 (데모 모드 fallback)
const PRESET_RECOMMENDATIONS = {
  activities: [
    {
      title: "100조각 퍼즐 도전하기",
      description: "72조각을 48분에 완성했으니, 100조각도 도전해볼 때예요!",
      reason: "시공간 + 처리속도 향상",
      domains: ["visuospatial", "processingSpeed"],
      duration: "50~60분",
      icon: "🧩",
    },
    {
      title: "과학 그림책 함께 읽기",
      description: "달에 대해 궁금해하고 있으니 호기심을 키워줄 수 있어요",
      reason: "언어 + 논리 향상",
      domains: ["language", "logic"],
      duration: "20~30분",
      icon: "📖",
    },
    {
      title: "가위로 곡선 오리기",
      description: "소근육이 빠르게 자라고 있어서 한 단계 올려봐요",
      reason: "소근육 + 집중력 향상",
      domains: ["fineMotor"],
      duration: "15~20분",
      icon: "✂️",
    },
  ],
  products: [
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
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { childProfile, weeklyReport } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            messages: [
              {
                role: "user",
                content: `당신은 아동 발달 전문가입니다. 아래 아이 정보와 주간 리포트를 보고 맞춤 추천을 생성하세요.

아이 정보: ${JSON.stringify(childProfile)}
주간 리포트: ${JSON.stringify(weeklyReport)}

추천 활동 3개와 추천 교구 3개를 JSON으로 응답:
{
  "activities": [{"title": "...", "description": "...", "reason": "...", "domains": [...], "duration": "...", "icon": "emoji"}],
  "products": [{"name": "...", "price": "₩N", "reason": "...", "link": "https://www.coupang.com", "icon": "emoji"}]
}`,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.content?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            return NextResponse.json(parsed);
          }
        }
      } catch {
        console.log("AI recommend failed, using preset");
      }
    }

    return NextResponse.json(PRESET_RECOMMENDATIONS);
  } catch {
    return NextResponse.json(PRESET_RECOMMENDATIONS);
  }
}
