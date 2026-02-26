/**
 * 활동 기록 기반 발달 점수 계산 엔진
 *
 * K-WPPSI-IV(웩슬러 유아 지능검사) 5대 영역에 대한
 * 활동별 기여도를 합산하여 월간 발달 점수를 추정합니다.
 *
 * ⚠ 이 점수는 공인 검사 결과가 아닌 관찰 기반 추정치입니다.
 */

import {
  ActivityRecord,
  ActivityData,
  ReadingData,
  DomainKey,
  MonthlyDataPoint,
  ChildProfile,
} from "@/types";

const DOMAIN_KEYS: DomainKey[] = [
  "verbalComprehension",
  "visualSpatial",
  "fluidReasoning",
  "workingMemory",
  "processingSpeed",
];

// 연령별 베이스라인: 활동 기록이 전혀 없을 때의 기준점
// K-WPPSI-IV 규준 35~45 백분위 근사값
const AGE_BASELINE: Record<number, Record<DomainKey, number>> = {
  4: {
    verbalComprehension: 52,
    visualSpatial: 50,
    fluidReasoning: 48,
    workingMemory: 50,
    processingSpeed: 50,
  },
  5: {
    verbalComprehension: 58,
    visualSpatial: 56,
    fluidReasoning: 53,
    workingMemory: 55,
    processingSpeed: 56,
  },
  6: {
    verbalComprehension: 63,
    visualSpatial: 61,
    fluidReasoning: 58,
    workingMemory: 60,
    processingSpeed: 61,
  },
};

// 활동 카테고리 키워드 → 영역 가중치 매핑
// 배열 순서대로 매칭 시도 (첫 번째 매칭만 적용)
const CATEGORY_DOMAIN_MAP: Array<[
  string[],
  Partial<Record<DomainKey, number>>
]> = [
  [["퍼즐"],                            { visualSpatial: 3.0, processingSpeed: 1.5 }],
  [["블록", "레고"],                     { visualSpatial: 2.5, fluidReasoning: 1.5 }],
  [["미술", "그림", "색연필", "만들기"],  { visualSpatial: 1.5, processingSpeed: 1.5 }],
  [["체육", "운동", "자전거", "달리기"],  { processingSpeed: 2.5, workingMemory: 0.5 }],
  [["코딩", "수학", "숫자"],             { fluidReasoning: 3.0, workingMemory: 2.0 }],
  [["음악", "악기", "피아노", "노래"],    { workingMemory: 3.0, processingSpeed: 1.5 }],
  [["역할", "놀이극"],                   { verbalComprehension: 2.0, fluidReasoning: 1.5 }],
  [["과학", "실험", "관찰"],             { fluidReasoning: 2.5, verbalComprehension: 1.5 }],
  [["독서", "읽기"],                     { verbalComprehension: 2.0, workingMemory: 1.5 }],
];

const DEFAULT_CATEGORY_WEIGHTS: Partial<Record<DomainKey, number>> = {
  fluidReasoning: 1.0,
  workingMemory: 1.0,
};

function getBaseline(age: number): Record<DomainKey, number> {
  return AGE_BASELINE[age] ?? AGE_BASELINE[5];
}

function getCategoryWeights(
  category: string
): Partial<Record<DomainKey, number>> {
  const entry = CATEGORY_DOMAIN_MAP.find(([keywords]) =>
    keywords.some((kw) => category.includes(kw))
  );
  return entry ? entry[1] : DEFAULT_CATEGORY_WEIGHTS;
}

/** 활동 1건 → 영역별 원시 점수 반환 */
function scoreActivity(
  record: ActivityRecord
): Partial<Record<DomainKey, number>> {
  const pts: Partial<Record<DomainKey, number>> = {};
  const add = (k: DomainKey, v: number) => {
    pts[k] = (pts[k] ?? 0) + v;
  };

  switch (record.type) {
    case "reading": {
      const d = record.data as ReadingData;
      // 독서 시간에 따른 언어이해 보너스 (20분마다 +1)
      const durationBonus = Math.floor((d.durationMin ?? 0) / 20);
      add("verbalComprehension", 2.5 + durationBonus);
      add("workingMemory", 1.5);
      if (d.readAlone) {
        add("verbalComprehension", 1.0); // 혼자 읽기: 자기주도 보너스
        add("processingSpeed", 1.0);
      }
      break;
    }
    case "question": {
      // "왜?"류 질문은 유동추론의 핵심 지표
      add("fluidReasoning", 3.0);
      add("verbalComprehension", 2.0);
      break;
    }
    case "emotion": {
      // 감정 표현 기록은 자기인식·언어이해 자극
      add("verbalComprehension", 1.5);
      break;
    }
    case "photo": {
      // 사진 기록: 관찰력 → 작업기억
      add("workingMemory", 0.5);
      break;
    }
    case "activity": {
      const d = record.data as ActivityData;
      const weights = getCategoryWeights(d.category ?? "");
      for (const [domain, w] of Object.entries(weights) as [
        DomainKey,
        number
      ][]) {
        add(domain, w);
      }
      // 퍼즐: 소요 시간에 따른 처리속도 추가 보너스 (30분마다 +1)
      if ((d.category ?? "").includes("퍼즐") && d.durationMin > 0) {
        add("processingSpeed", Math.floor(d.durationMin / 30));
      }
      break;
    }
  }

  return pts;
}

/**
 * 한 달분 활동 목록 → 영역별 최종 점수 계산
 *
 * 공식: score = baseline + min(sqrt(rawPoints) × MULTIPLIER, MAX_BONUS)
 * sqrt 적용으로 활동이 많을수록 증가폭이 자연스럽게 둔화됩니다.
 */
function scoreMonth(
  activities: ActivityRecord[],
  age: number
): Record<DomainKey, number> {
  const baseline = getBaseline(age);
  const rawPts = Object.fromEntries(
    DOMAIN_KEYS.map((k) => [k, 0])
  ) as Record<DomainKey, number>;

  for (const act of activities) {
    const pts = scoreActivity(act);
    for (const k of DOMAIN_KEYS) {
      rawPts[k] += pts[k] ?? 0;
    }
  }

  const MULTIPLIER = 4.0;
  const MAX_BONUS = 25;

  return Object.fromEntries(
    DOMAIN_KEYS.map((k) => [
      k,
      Math.min(
        100,
        Math.max(
          40,
          Math.round(
            baseline[k] +
              Math.min(Math.sqrt(rawPts[k]) * MULTIPLIER, MAX_BONUS)
          )
        )
      ),
    ])
  ) as Record<DomainKey, number>;
}

function toYearMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function toKoreanLabel(date: Date): string {
  return `${date.getMonth() + 1}월`;
}

/**
 * 전체 활동 기록 → 월간 추이 데이터 생성
 *
 * - 최근 4개월 실제 데이터 (활동 기록 기반)
 * - 이후 3개월 예측 데이터 (마지막 2개월 추세 외삽)
 */
export function computeMonthlyData(
  activities: ActivityRecord[],
  child: ChildProfile
): MonthlyDataPoint[] {
  const now = new Date();
  const age = child.age ?? 5;

  // 최근 4개월 실제 점수 계산
  const actual: MonthlyDataPoint[] = [];
  for (let offset = -3; offset <= 0; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const key = toYearMonthKey(d);
    // timestamp의 앞 7자리(YYYY-MM)로 월 매칭 (타임존 무관)
    const monthActivities = activities.filter((a) =>
      a.timestamp.startsWith(key)
    );
    actual.push({
      month: toKoreanLabel(d),
      scores: scoreMonth(monthActivities, age),
    });
  }

  // 예측 3개월: 마지막 2개월 추세 기반 외삽
  const last = actual[actual.length - 1].scores;
  const prev = actual[actual.length - 2].scores;

  const predicted: MonthlyDataPoint[] = [1, 2, 3].map((i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const scores = Object.fromEntries(
      DOMAIN_KEYS.map((k) => {
        // 추세가 하락해도 최소 월 1점 성장으로 보정
        const trend = Math.max(last[k] - prev[k], 1);
        return [k, Math.min(95, Math.round(last[k] + trend * i * 0.8))];
      })
    ) as Record<DomainKey, number>;
    return { month: toKoreanLabel(d), scores, predicted: true };
  });

  return [...actual, ...predicted];
}
