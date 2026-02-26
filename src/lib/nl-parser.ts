/**
 * 자연어 활동 입력 파서
 *
 * "오늘 퍼즐 30분 하고 구름빵 읽었어"
 *  → [activity(퍼즐, 30분), reading(구름빵)]
 *
 * AI 없이도 동작하는 규칙 기반 순수 함수 모듈.
 * API 키가 있을 때는 /api/parse-activity 호출로 AI 보강 가능.
 */

import { ActivityType, ActivityData, ReadingData, QuestionData, EmotionData } from "@/types";
import { CATEGORY_DOMAIN_MAP } from "@/lib/score-engine";

// ─── 타입 ─────────────────────────────────────────────────────────────────

export interface ParsedActivity {
  type: ActivityType;
  /** 파싱 확신도 0~1. < 0.7이면 UI에서 "확인 필요" 표시 */
  confidence: number;
  data: ActivityData | ReadingData | QuestionData | EmotionData;
}

export interface ParseResult {
  activities: ParsedActivity[];
  /** 어떤 패턴에도 매칭되지 않은 원본 텍스트 (디버그용) */
  unparsed: string | null;
}

// ─── 상수 ─────────────────────────────────────────────────────────────────

/** score-engine의 CATEGORY_DOMAIN_MAP에서 키워드를 동적 추출하여 단일 진실 원천 유지 */
const ACTIVITY_KEYWORD_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const [keywords] of CATEGORY_DOMAIN_MAP) {
    const primary = keywords[0]; // 첫 번째 키워드를 카테고리 대표명으로 사용
    // 카테고리 UI 이름에 맞게 매핑 (RecordSheet.tsx의 ACTIVITY_CATEGORIES와 일치)
    const category = (() => {
      if (["퍼즐"].includes(primary)) return "퍼즐";
      if (["블록", "레고"].includes(primary) || keywords.includes("레고")) return "블록";
      if (["미술", "그림", "색연필", "만들기"].includes(primary)) return "미술";
      if (["체육", "운동", "자전거", "달리기"].includes(primary)) return "운동";
      if (["코딩", "수학", "숫자"].includes(primary)) return "학습";
      return "기타";
    })();
    for (const kw of keywords) {
      map[kw] = category;
    }
  }
  // 독서/역할놀이/과학은 score-engine에서 별도 처리되므로 여기서는 기타로
  return map;
})();

const READING_KEYWORDS = ["읽었", "읽어줬", "읽어 줬", "독서", "동화", "그림책", "책"];
const QUESTION_KEYWORDS = ["물어봤", "물어봤어", "질문", "궁금해했", "궁금해 했"];
const EMOTION_KEYWORD_MAP: Record<string, { emoji: string; label: string }> = {
  "행복": { emoji: "😊", label: "행복" },
  "기뻤": { emoji: "😊", label: "행복" },
  "기분이 좋": { emoji: "😊", label: "행복" },
  "신났": { emoji: "🤩", label: "신남" },
  "신나": { emoji: "🤩", label: "신남" },
  "짜증": { emoji: "😤", label: "짜증" },
  "화났": { emoji: "😤", label: "짜증" },
  "울었": { emoji: "😢", label: "슬픔" },
  "슬펐": { emoji: "😢", label: "슬픔" },
  "슬퍼": { emoji: "😢", label: "슬픔" },
  "피곤": { emoji: "😴", label: "피곤" },
  "힘들": { emoji: "😴", label: "피곤" },
};

// 질문 문장 패턴: 직접 질문 형태
const QUESTION_SENTENCE_PATTERN = /(?:왜|뭐|어떻게|어디|언제|누구|무엇)[^.,?!]*(?:\?|이야|이에요|이래요|인가요|인지|할까)/;

// ─── 시간 추출 ──────────────────────────────────────────────────────────

export function extractDuration(text: string): number | null {
  let total = 0;
  let found = false;

  const hourMatch = text.match(/(\d+)\s*시간/);
  if (hourMatch) {
    total += parseInt(hourMatch[1]) * 60;
    found = true;
  }
  // "시간 반" 또는 "반 시간"
  if (/시간\s*반|반\s*시간/.test(text)) {
    total += 30;
    found = true;
  }
  const minMatch = text.match(/(\d+)\s*분/);
  if (minMatch) {
    total += parseInt(minMatch[1]);
    found = true;
  }

  return found ? Math.min(total, 600) : null;
}

// ─── 문장 분리 ─────────────────────────────────────────────────────────

function splitSentences(text: string): string[] {
  // 1단계: 인용부호 내부 보호 (질문 텍스트 안의 구분자를 무시)
  const quotedParts: string[] = [];
  const protected_ = text.replace(/"([^"]+)"/g, (_, q: string) => {
    const idx = quotedParts.length;
    quotedParts.push(q);
    return `__Q${idx}__`;
  });

  // 2단계: 접속사/구분자 기반 분할
  const segments = protected_.split(
    /[,，]\s*|(?:하고|그리고|이랑|랑|다음에|후에|한\s*다음|한\s*후)\s*/
  );

  // 3단계: 인용부호 복원 + 필터링
  return segments
    .map((s) => s.replace(/__Q(\d+)__/g, (_: string, i: string) => `"${quotedParts[Number(i)]}"`))
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

// ─── 단일 문장 분류 ────────────────────────────────────────────────────

function classifySentence(sentence: string): ParsedActivity | null {
  const s = sentence.trim();
  if (!s) return null;

  const duration = extractDuration(s);

  // 우선순위 1: 질문 감지
  const inlineQuote = s.match(/"([^"]+)"/);
  if (inlineQuote && QUESTION_KEYWORDS.some((k) => s.includes(k))) {
    return {
      type: "question",
      confidence: 0.9,
      data: { quote: inlineQuote[1].trim() } satisfies QuestionData,
    };
  }
  if (QUESTION_KEYWORDS.some((k) => s.includes(k)) || QUESTION_SENTENCE_PATTERN.test(s)) {
    // 직접 질문 형태에서 핵심 내용 추출
    const quoteContent = s
      .replace(/(?:라고|이라고)\s*(?:물어봤|질문|궁금).*/, "")
      .replace(/아이가|아이는|지우가|지우는/, "")
      .trim();
    return {
      type: "question",
      confidence: inlineQuote ? 0.9 : 0.7,
      data: { quote: quoteContent || s } satisfies QuestionData,
    };
  }

  // 우선순위 2: 감정 감지
  for (const [keyword, emotionData] of Object.entries(EMOTION_KEYWORD_MAP)) {
    if (s.includes(keyword)) {
      return {
        type: "emotion",
        confidence: 0.8,
        data: {
          emoji: emotionData.emoji,
          label: emotionData.label,
          note: s,
        } satisfies EmotionData,
      };
    }
  }

  // 우선순위 3: 독서 감지
  if (READING_KEYWORDS.some((k) => s.includes(k))) {
    // 책 제목 추출: 《》, <>, "", 또는 동사 앞 명사구
    const titleMatch =
      s.match(/[《<「『]([^》>」』]+)[》>」』]/) ||
      s.match(/"([^"]+)"/) ||
      s.match(/^(.+?)(?:을|를)?\s*(?:읽|독서)/) ||
      s.match(/(.+?)\s+(?:읽었|읽어줬|독서)/);

    const rawTitle = titleMatch?.[1]?.trim();
    // "오늘", "책", "동화" 같은 일반 명사는 제목으로 처리하지 않음
    const genericWords = ["오늘", "책", "동화", "그림책", "또", "다시"];
    const bookTitle =
      rawTitle && !genericWords.includes(rawTitle) ? rawTitle : undefined;

    return {
      type: "reading",
      confidence: bookTitle ? 0.9 : 0.6,
      data: {
        bookTitle: bookTitle ?? "제목 미입력",
        readAlone: s.includes("혼자"),
        durationMin: duration ?? undefined,
      } satisfies ReadingData,
    };
  }

  // 우선순위 4: 활동 감지 (CATEGORY_DOMAIN_MAP 키워드 매칭)
  for (const [keyword, category] of Object.entries(ACTIVITY_KEYWORD_MAP)) {
    if (s.includes(keyword)) {
      return {
        type: "activity",
        confidence: 0.9,
        data: {
          category,
          durationMin: duration ?? 0,
          detail: s,
        } satisfies ActivityData,
      };
    }
  }

  // 폴백: 인식 불가 → 기타 카테고리
  return {
    type: "activity",
    confidence: 0.3,
    data: {
      category: "기타",
      durationMin: duration ?? 0,
      detail: s,
    } satisfies ActivityData,
  };
}

// ─── 메인 파서 ─────────────────────────────────────────────────────────

/**
 * 자연어 텍스트를 파싱하여 활동 기록 목록을 반환한다.
 *
 * @example
 * parseNaturalInput("퍼즐 30분 하고 구름빵 읽었어")
 * // → { activities: [activity(퍼즐,30), reading(구름빵)], unparsed: null }
 */
export function parseNaturalInput(text: string): ParseResult {
  const trimmed = text.trim().slice(0, 500); // 최대 500자 처리
  if (!trimmed) {
    return { activities: [], unparsed: null };
  }

  const sentences = splitSentences(trimmed);
  if (sentences.length === 0) {
    return { activities: [], unparsed: trimmed };
  }

  const activities: ParsedActivity[] = [];
  const unparsedParts: string[] = [];

  for (const sentence of sentences) {
    const result = classifySentence(sentence);
    if (result) {
      activities.push(result);
    } else {
      unparsedParts.push(sentence);
    }
  }

  return {
    activities,
    unparsed: unparsedParts.length > 0 ? unparsedParts.join(", ") : null,
  };
}
