import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/analyze — 기록 기반 발달 분석
 * Claude API 사용 가능 시 AI 분석, 불가 시 프리셋 응답
 */

// 프리셋 분석 결과 (데모 모드 fallback)
const PRESET_RESPONSE = {
  insights: [
    {
      type: "progress",
      icon: "📈",
      message: "퍼즐 완성 시간이 지난주보다 4분 빨라졌어요. 처리 속도가 꾸준히 좋아지고 있어요!",
      domain: "processingSpeed",
    },
    {
      type: "observation",
      icon: "💡",
      message: '"왜 달은 낮에도 있어?" — 과학적 사고의 시작이에요! 이런 질문을 많이 하면 논리력이 쑥쑥 자라요.',
      domain: "logic",
    },
    {
      type: "encouragement",
      icon: "🌟",
      message: "이번 주 벌써 4번째 기록이에요! 꾸준한 관찰이 아이 성장의 가장 큰 힘이에요.",
      domain: "",
    },
  ],
  todayTip: "오늘은 블록 놀이를 해보세요. 시공간 능력과 처리속도를 동시에 자극할 수 있어요.",
  domainScores: {
    language: 75,
    visuospatial: 82,
    workingMemory: 70,
    processingSpeed: 78,
    logic: 68,
    fineMotor: 72,
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activities, childProfile } = body;

    // Claude API 키가 환경변수에 있으면 AI 분석 시도
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
            model: "claude-3-haiku-20240307",
            max_tokens: 1024,
            messages: [
              {
                role: "user",
                content: `당신은 아동 발달 전문가입니다. 아래 기록을 분석하여 인사이트를 생성하세요.

아이 정보: ${JSON.stringify(childProfile)}
오늘 기록: ${JSON.stringify(activities)}

규칙:
1. 전문 용어 사용 ❌ → 엄마가 이해하는 쉬운 말로
2. 긍정적 톤 우선
3. IQ 점수/수치 절대 언급 ❌

JSON 형식으로 응답:
{
  "insights": [{"type": "progress|observation|encouragement", "icon": "emoji", "message": "...", "domain": "..."}],
  "todayTip": "...",
  "domainScores": {"language": N, "visuospatial": N, "workingMemory": N, "processingSpeed": N, "logic": N, "fineMotor": N}
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
        // AI 분석 실패 시 프리셋으로 fallback
        console.log("AI analyze failed, using preset");
      }
    }

    // 프리셋 fallback
    return NextResponse.json(PRESET_RESPONSE);
  } catch {
    return NextResponse.json(PRESET_RESPONSE);
  }
}
