import { NextRequest, NextResponse } from "next/server";
import { generateCoupangLink } from "@/lib/affiliate";
import { callLLM } from "@/lib/llm-client";

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
      domains: ["visualSpatial", "processingSpeed"],
      duration: "50~60분",
      icon: "🧩",
    },
    {
      title: "과학 그림책 함께 읽기",
      description: "달에 대해 궁금해하고 있으니 호기심을 키워줄 수 있어요",
      reason: "언어 + 논리 향상",
      domains: ["verbalComprehension", "fluidReasoning"],
      duration: "20~30분",
      icon: "📖",
    },
    {
      title: "가위로 곡선 오리기",
      description: "소근육이 빠르게 자라고 있어서 한 단계 올려봐요",
      reason: "소근육 + 집중력 향상",
      domains: ["visualSpatial"],
      duration: "15~20분",
      icon: "✂️",
    },
  ],
  products: [
    {
      name: "라벤스부르거 100P 동물 퍼즐",
      price: "1만원대",
      reason: "시공간 능력 강화에 도움돼요",
      link: generateCoupangLink("라벤스부르거 100P 동물 퍼즐"),
      icon: "🧩",
    },
    {
      name: "달에 대해 알려줘 그림책",
      price: "1만원대",
      reason: "호기심을 탐구로 연결시켜줘요",
      link: generateCoupangLink("달에 대해 알려줘 그림책"),
      icon: "📚",
    },
    {
      name: "유아 안전가위 오리기 세트",
      price: "9천원대",
      reason: "소근육 발달 단계에 딱 맞는 난이도예요",
      link: generateCoupangLink("유아 안전가위 오리기 세트"),
      icon: "✂️",
    },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { childProfile, weeklyReport, temperament, monthlyData } = body;

    // 기질 맥락 블록
    let temperamentCtx = "";
    if (temperament) {
      const envMap: Record<string, string> = {
        bold: "새로운 것에 거리낌 없이 뛰어드는 편",
        adaptive: "살펴보다 적응하는 편",
        inhibited: "신중한 편",
      };
      temperamentCtx = `
[아이 기질]
새로운 환경: ${envMap[temperament.newEnvironment] ?? temperament.newEnvironment}
${temperament.fasterThanPeers?.length > 0 ? `또래보다 앞선 영역: ${temperament.fasterThanPeers.join(", ")}` : ""}
${temperament.currentObsession?.length > 0 ? `현재 관심사: ${temperament.currentObsession.join(", ")}` : ""}
`;
    }

    // 월간 추이 블록 (최근 3개월)
    let trendCtx = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (monthlyData && Array.isArray(monthlyData) && monthlyData.length >= 2) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recent = (monthlyData as any[]).slice(-3).filter((m) => !m.predicted);
      if (recent.length >= 2) {
        const domainLabels: Record<string, string> = {
          verbalComprehension: "언어이해",
          visualSpatial: "시공간",
          fluidReasoning: "유동추론",
          workingMemory: "작업기억",
          processingSpeed: "처리속도",
        };
        trendCtx = `\n[최근 발달 추이]\n`;
        trendCtx += recent.map((m) =>
          `${m.month}: ${Object.entries(m.scores ?? {}).map(([k, v]) => `${domainLabels[k] ?? k}=${v}`).join(", ")}`
        ).join("\n") + "\n";
      }
    }

    const prompt = `당신은 아동 발달 전문가입니다. 아래 아이 정보와 주간 리포트를 보고 맞춤 추천을 생성하세요.

아이 정보: 이름 ${childProfile.nickname}, 만 ${childProfile.age}세
${temperamentCtx}
주간 리포트: ${JSON.stringify(weeklyReport)}
${trendCtx}

추천 활동 3개와 추천 교구 3개를 JSON으로 응답:
{
  "activities": [{"title": "...", "description": "...", "reason": "...", "domains": [...], "duration": "...", "icon": "emoji"}],
  "products": [{"name": "...", "price": "1만원대", "reason": "...", "icon": "emoji"}]
}
*주의*: products의 link 필드는 생성하지 마세요. (서버에서 생성함)`;

    try {
      const text = await callLLM(prompt, "claude-3-5-sonnet-20240620");
      if (text) {
        const parsed = JSON.parse(text);

        // 링크 동적 생성 주입
        if (parsed.products && Array.isArray(parsed.products)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parsed.products = parsed.products.map((p: any) => ({
            ...p,
            link: generateCoupangLink(p.name),
          }));
        }

        return NextResponse.json(parsed);
      }
    } catch {
      // AI recommend failed, using preset fallback
    }

    return NextResponse.json(PRESET_RECOMMENDATIONS);
  } catch {
    return NextResponse.json(PRESET_RECOMMENDATIONS);
  }
}
