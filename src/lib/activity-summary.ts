/**
 * 최근 N일간 활동 기록을 AI 프롬프트용으로 압축 요약
 *
 * 원시 ActivityRecord[] 배열을 그대로 전달하면 토큰이 폭증하므로,
 * 카테고리별 횟수/시간 등 통계 형태로 압축한다 (~100 토큰 수준).
 */

import { ActivityRecord, ActivityData, ReadingData, QuestionData } from "@/types";

export interface ActivitySummary {
  totalActivities: number;
  /** 카테고리별 횟수 + 총 시간 (분) */
  categoryBreakdown: Record<string, { count: number; totalMinutes: number }>;
  readingStats: { count: number; totalMinutes: number; titles: string[] };
  questionStats: { count: number; topQuestions: string[] };
  emotionBreakdown: Record<string, number>;
  photoCount: number;
}

/** 최근 N일간 ActivityRecord를 요약 통계로 압축 */
export function summarizeActivities(
  activities: ActivityRecord[],
  days = 7
): ActivitySummary {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const recent = activities.filter((a) => new Date(a.timestamp) >= cutoff && !a.isSample);

  const summary: ActivitySummary = {
    totalActivities: recent.length,
    categoryBreakdown: {},
    readingStats: { count: 0, totalMinutes: 0, titles: [] },
    questionStats: { count: 0, topQuestions: [] },
    emotionBreakdown: {},
    photoCount: 0,
  };

  for (const act of recent) {
    switch (act.type) {
      case "activity": {
        const d = act.data as ActivityData;
        const cat = d.category || "기타";
        if (!summary.categoryBreakdown[cat]) {
          summary.categoryBreakdown[cat] = { count: 0, totalMinutes: 0 };
        }
        summary.categoryBreakdown[cat].count++;
        summary.categoryBreakdown[cat].totalMinutes += d.durationMin ?? 0;
        break;
      }
      case "reading": {
        const d = act.data as ReadingData;
        summary.readingStats.count++;
        summary.readingStats.totalMinutes += d.durationMin ?? 0;
        if (d.bookTitle && d.bookTitle !== "제목 미입력") {
          summary.readingStats.titles.push(d.bookTitle);
        }
        break;
      }
      case "question": {
        const d = act.data as QuestionData;
        summary.questionStats.count++;
        if (summary.questionStats.topQuestions.length < 3 && d.quote) {
          summary.questionStats.topQuestions.push(d.quote);
        }
        break;
      }
      case "emotion": {
        const label = (act.data as { label?: string }).label ?? "기타";
        summary.emotionBreakdown[label] = (summary.emotionBreakdown[label] ?? 0) + 1;
        break;
      }
      case "photo": {
        summary.photoCount++;
        break;
      }
    }
  }

  // 책 제목 중복 제거 + 최대 5개
  summary.readingStats.titles = [...new Set(summary.readingStats.titles)].slice(0, 5);

  return summary;
}

/** ActivitySummary → AI 프롬프트용 텍스트 블록 */
export function summaryToText(summary: ActivitySummary): string {
  const lines: string[] = [`총 ${summary.totalActivities}건의 활동`];

  for (const [cat, data] of Object.entries(summary.categoryBreakdown)) {
    lines.push(`${cat}: ${data.count}회, 총 ${data.totalMinutes}분`);
  }
  if (summary.readingStats.count > 0) {
    const titles = summary.readingStats.titles.length > 0
      ? ` (${summary.readingStats.titles.join(", ")})`
      : "";
    lines.push(`독서: ${summary.readingStats.count}회, 총 ${summary.readingStats.totalMinutes}분${titles}`);
  }
  if (summary.questionStats.count > 0) {
    const ex = summary.questionStats.topQuestions.length > 0
      ? ` 예: "${summary.questionStats.topQuestions[0]}"`
      : "";
    lines.push(`질문: ${summary.questionStats.count}회${ex}`);
  }
  if (Object.keys(summary.emotionBreakdown).length > 0) {
    const emotions = Object.entries(summary.emotionBreakdown)
      .map(([e, c]) => `${e}(${c})`)
      .join(", ");
    lines.push(`감정 기록: ${emotions}`);
  }

  return lines.join("\n");
}
