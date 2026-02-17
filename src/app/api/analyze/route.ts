import { NextRequest, NextResponse } from "next/server";
import { calculateMonths, getKDSTChecklist } from "@/data/k-dst";

/**
 * POST /api/analyze — 기록 기반 발달 분석 (K-DST 기준 적용)
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
      domain: "fluidReasoning",
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
    verbalComprehension: 75,
    visualSpatial: 82,
    fluidReasoning: 68,
    workingMemory: 70,
    processingSpeed: 78,
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activities, childProfile } = body;

    // 월령 계산 및 K-DST 기준 가져오기
    let kdstContext = "";
    if (childProfile.birthDate) {
      const months = calculateMonths(childProfile.birthDate);
      const checklist = getKDSTChecklist(months);
      if (checklist) {
        kdstContext = `
[발달 기준: K-DST ${checklist.range} (${months}개월)]
주요 과업:
${checklist.tasks.map((t) => `- ${t.domain}: ${t.question}`).join("\n")}

분석 시 위 과업들의 달성 여부를 추정해보세요.
`;
      }
    }

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
${kdstContext}

규칙:
1. 전문 용어 사용 ❌ → 엄마가 이해하는 쉬운 말로
2. 긍정적 톤 우선
3. K-DST 기준에 비추어 잘 성장하고 있는지 언급 (가능한 경우)
4. 점수는 상대적 추정치로 제공

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
        // AI analyze failed, using preset fallback
      }
    }

    // 프리셋 fallback
    return NextResponse.json(PRESET_RESPONSE);
  } catch {
    return NextResponse.json(PRESET_RESPONSE);
  }
}
