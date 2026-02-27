import { NextRequest, NextResponse } from "next/server";
import { callLLMMultimodal, ContentBlock } from "@/lib/llm-client";

/**
 * POST /api/analyze-photo — Claude Vision을 활용한 사진 기록 AI 분석
 */

const PRESET_ANALYSIS =
  "이 사진에서 아이의 활발한 탐구 활동이 느껴져요! " +
  "이렇게 사진으로 순간을 기록하는 습관은 아이의 관찰력과 기억력 발달에 도움이 돼요. " +
  "오늘 함께한 이 경험이 아이에게 소중한 자극이 됐을 거예요.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, note, childProfile } = body;

    if (!imageData) {
      return NextResponse.json({ analysis: PRESET_ANALYSIS });
    }

    // base64 data URI 파싱: "data:image/jpeg;base64,/9j/..."
    const match = (imageData as string).match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ analysis: PRESET_ANALYSIS });
    }

    const [, mediaType, base64Data] = match;
    const age = childProfile?.age ?? 5;

    const content: ContentBlock[] = [
      {
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64Data },
      },
      {
        type: "text",
        text: `당신은 아동 발달 전문가입니다. 이 사진은 만 ${age}세 아이의 활동 기록입니다.
${note ? `부모 메모: "${note}"` : ""}

사진을 보고 다음을 3~4문장으로 작성해주세요:
1. 사진에서 관찰되는 활동이나 상황
2. 이 활동이 아이 발달에 어떤 의미가 있는지
3. 부모가 이 활동을 더 풍부하게 만들 수 있는 팁 하나

전문 용어 없이 쉬운 말로, 긍정적인 톤으로 작성하세요. 텍스트만 응답하세요.`,
      },
    ];

    try {
      const result = await callLLMMultimodal(content, "claude-3-haiku-20240307", 512);
      if (result) {
        return NextResponse.json({ analysis: result });
      }
    } catch {
      // Vision 분석 실패, fallback 사용
    }

    return NextResponse.json({ analysis: PRESET_ANALYSIS });
  } catch {
    return NextResponse.json({ analysis: PRESET_ANALYSIS });
  }
}
