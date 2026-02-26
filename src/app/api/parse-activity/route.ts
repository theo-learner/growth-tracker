import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm-client";
import { parseNaturalInput, ParseResult } from "@/lib/nl-parser";

/**
 * POST /api/parse-activity — 자연어 활동 입력 파싱
 *
 * 규칙 기반 파서를 항상 실행하고, AI(Claude)가 가능하면 결과를 보강한다.
 * API 키 없이도 규칙 기반 결과를 반환하므로 fallback이 항상 존재한다.
 */
export async function POST(request: NextRequest) {
  let text = "";
  let ruleResult: ParseResult;

  try {
    const body = await request.json();
    text = (body.text ?? "").slice(0, 500);
    ruleResult = parseNaturalInput(text);
  } catch {
    return NextResponse.json({ activities: [], unparsed: null } satisfies ParseResult);
  }

  if (!text.trim()) {
    return NextResponse.json(ruleResult);
  }

  // AI 보강 시도 (실패하면 규칙 기반 결과 반환)
  const prompt = `당신은 한국 부모의 육아 일지를 구조화된 데이터로 변환하는 도우미입니다.

입력 텍스트에서 아이의 활동들을 파악하여 각각을 JSON으로 분류하세요.

## 활동 타입
- activity: 놀이/운동/학습 등 신체/인지 활동
- reading: 책 읽기
- question: 아이가 한 질문
- emotion: 감정 상태 기록

## activity 카테고리 (반드시 이 중 하나)
퍼즐, 블록, 학습, 미술, 운동, 기타

## 감정 옵션
- 행복: 😊, 짜증: 😤, 슬픔: 😢, 피곤: 😴, 신남: 🤩, 보통: 😐

## 입력
"${text}"

## 응답 형식 (JSON만, 설명 없음)
{
  "activities": [
    {
      "type": "activity",
      "confidence": 0.95,
      "data": { "category": "퍼즐", "durationMin": 30, "detail": "원본 문장" }
    },
    {
      "type": "reading",
      "confidence": 0.9,
      "data": { "bookTitle": "구름빵", "readAlone": false, "durationMin": null }
    }
  ],
  "unparsed": null
}`;

  try {
    const aiText = await callLLM(prompt, "claude-3-haiku-20240307", 512);
    if (aiText) {
      const aiResult = JSON.parse(aiText) as ParseResult;
      // 기본 유효성 검증
      if (Array.isArray(aiResult.activities) && aiResult.activities.length > 0) {
        return NextResponse.json(aiResult);
      }
    }
  } catch {
    // AI 파싱 실패 → 규칙 기반 결과 사용
  }

  return NextResponse.json(ruleResult);
}
