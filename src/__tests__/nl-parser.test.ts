import { describe, it, expect } from "vitest";
import { parseNaturalInput, extractDuration } from "@/lib/nl-parser";

// ─── 시간 추출 ─────────────────────────────────────────────────────────────

describe("extractDuration", () => {
  it("분 단위 추출", () => {
    expect(extractDuration("퍼즐 30분 했어")).toBe(30);
  });
  it("시간 단위 추출", () => {
    expect(extractDuration("1시간 운동했어")).toBe(60);
  });
  it("시간+분 복합", () => {
    expect(extractDuration("1시간 30분 독서했어")).toBe(90);
  });
  it("시간 반", () => {
    expect(extractDuration("1시간 반 퍼즐 했어")).toBe(90);
  });
  it("숫자 없으면 null", () => {
    expect(extractDuration("블록 놀이 했어")).toBeNull();
  });
  it("600분 상한 클램핑", () => {
    expect(extractDuration("700분 했어")).toBe(600);
  });
});

// ─── 단일 활동 파싱 ───────────────────────────────────────────────────────

describe("parseNaturalInput — 단일 활동", () => {
  it("퍼즐 → activity(퍼즐)", () => {
    const result = parseNaturalInput("퍼즐 30분 했어");
    expect(result.activities).toHaveLength(1);
    expect(result.activities[0].type).toBe("activity");
    expect((result.activities[0].data as { category: string }).category).toBe("퍼즐");
    expect((result.activities[0].data as { durationMin: number }).durationMin).toBe(30);
  });

  it("블록 → activity(블록)", () => {
    const result = parseNaturalInput("블록으로 탑 만들었어");
    expect(result.activities[0].type).toBe("activity");
    expect((result.activities[0].data as { category: string }).category).toBe("블록");
  });

  it("레고 → activity(블록)", () => {
    const result = parseNaturalInput("레고 1시간 했어");
    expect((result.activities[0].data as { category: string }).category).toBe("블록");
    expect((result.activities[0].data as { durationMin: number }).durationMin).toBe(60);
  });

  it("미술 → activity(미술)", () => {
    const result = parseNaturalInput("그림 그렸어");
    expect((result.activities[0].data as { category: string }).category).toBe("미술");
  });

  it("운동 → activity(운동)", () => {
    const result = parseNaturalInput("자전거 탔어요");
    expect((result.activities[0].data as { category: string }).category).toBe("운동");
  });

  it("학습(코딩) → activity(학습)", () => {
    const result = parseNaturalInput("수학 공부 30분 했어");
    expect((result.activities[0].data as { category: string }).category).toBe("학습");
  });
});

// ─── 독서 파싱 ──────────────────────────────────────────────────────────

describe("parseNaturalInput — 독서", () => {
  it("책 제목 없이 → reading, confidence 낮음", () => {
    const result = parseNaturalInput("책 읽었어");
    expect(result.activities[0].type).toBe("reading");
    expect(result.activities[0].confidence).toBeLessThan(0.8);
  });

  it("책 제목 추출 (동사 앞 명사구)", () => {
    const result = parseNaturalInput("구름빵 읽었어");
    expect(result.activities[0].type).toBe("reading");
    expect((result.activities[0].data as { bookTitle: string }).bookTitle).toContain("구름빵");
  });

  it("독서 시간 추출", () => {
    const result = parseNaturalInput("독서 20분 했어");
    expect(result.activities[0].type).toBe("reading");
    expect((result.activities[0].data as { durationMin?: number }).durationMin).toBe(20);
  });

  it("혼자 읽기 감지", () => {
    const result = parseNaturalInput("혼자 책 읽었어");
    expect((result.activities[0].data as { readAlone: boolean }).readAlone).toBe(true);
  });

  it("같이 읽기 기본값", () => {
    const result = parseNaturalInput("구름빵 읽어줬어");
    expect((result.activities[0].data as { readAlone: boolean }).readAlone).toBe(false);
  });
});

// ─── 질문 파싱 ──────────────────────────────────────────────────────────

describe("parseNaturalInput — 질문", () => {
  it("인용부호 형태 질문 파싱", () => {
    const result = parseNaturalInput('"왜 하늘은 파란색이야?"라고 물어봤어');
    expect(result.activities[0].type).toBe("question");
    expect((result.activities[0].data as { quote: string }).quote).toContain("왜 하늘은 파란색이야?");
    expect(result.activities[0].confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("물어봤 키워드 포함 → question", () => {
    const result = parseNaturalInput("달은 왜 낮에도 있어?라고 물어봤어");
    expect(result.activities[0].type).toBe("question");
  });
});

// ─── 감정 파싱 ──────────────────────────────────────────────────────────

describe("parseNaturalInput — 감정", () => {
  it("행복 감지", () => {
    const result = parseNaturalInput("오늘 기분이 좋았어");
    expect(result.activities[0].type).toBe("emotion");
    expect((result.activities[0].data as { emoji: string }).emoji).toBe("😊");
  });

  it("울었 → 슬픔", () => {
    const result = parseNaturalInput("오늘 많이 울었어");
    expect(result.activities[0].type).toBe("emotion");
    expect((result.activities[0].data as { label: string }).label).toBe("슬픔");
  });

  it("짜증 감지", () => {
    const result = parseNaturalInput("짜증을 많이 냈어요");
    expect(result.activities[0].type).toBe("emotion");
    expect((result.activities[0].data as { label: string }).label).toBe("짜증");
  });
});

// ─── 복수 활동 파싱 ───────────────────────────────────────────────────────

describe("parseNaturalInput — 복수 활동", () => {
  it("하고로 분리 → 2개", () => {
    const result = parseNaturalInput("퍼즐 30분 하고 구름빵 읽었어");
    expect(result.activities).toHaveLength(2);
    expect(result.activities[0].type).toBe("activity");
    expect(result.activities[1].type).toBe("reading");
  });

  it("그리고로 분리 → 2개", () => {
    const result = parseNaturalInput("블록 했어 그리고 그림 그렸어");
    expect(result.activities).toHaveLength(2);
  });

  it("쉼표로 분리 → 2개", () => {
    const result = parseNaturalInput("운동 1시간, 독서 30분 했어");
    expect(result.activities).toHaveLength(2);
    expect(result.activities[0].type).toBe("activity");
    expect(result.activities[1].type).toBe("reading");
  });

  it("3개 활동", () => {
    const result = parseNaturalInput("퍼즐 하고 그림 그리고 책 읽었어");
    expect(result.activities).toHaveLength(3);
  });

  it("인용부호 안 쉼표는 분리하지 않음", () => {
    const result = parseNaturalInput('"하늘은 왜 파란색이야, 구름은요?"라고 물어봤어');
    expect(result.activities).toHaveLength(1);
    expect(result.activities[0].type).toBe("question");
  });
});

// ─── 엣지 케이스 ──────────────────────────────────────────────────────────

describe("parseNaturalInput — 엣지 케이스", () => {
  it("빈 문자열 → 빈 배열", () => {
    expect(parseNaturalInput("").activities).toHaveLength(0);
  });

  it("공백만 → 빈 배열", () => {
    expect(parseNaturalInput("   ").activities).toHaveLength(0);
  });

  it("인식 불가 텍스트 → 기타, confidence 0.3", () => {
    const result = parseNaturalInput("뭔가 했어");
    expect(result.activities[0].type).toBe("activity");
    expect((result.activities[0].data as { category: string }).category).toBe("기타");
    expect(result.activities[0].confidence).toBe(0.3);
  });

  it("500자 초과 → 500자만 처리", () => {
    const longText = "퍼즐 하고 ".repeat(100);
    const result = parseNaturalInput(longText);
    expect(result.activities.length).toBeGreaterThan(0);
  });
});
