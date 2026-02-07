"use client";

import { PRESET_ANALYSIS } from "@/lib/sample-data";

/**
 * 일간 인사이트 카드 v2 — 그린 틴트 배경 + 부드러운 레이아웃
 */
export default function DailyInsight() {
  const { insights, todayTip } = PRESET_ANALYSIS.dailyInsight;

  return (
    <div className="card-insight">
      {/* 헤더 — 뱃지 스타일 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-soft-green/15 flex items-center justify-center">
          <span className="text-sm">✨</span>
        </div>
        <h3 className="text-sm font-bold text-soft-green-600">AI 인사이트</h3>
      </div>

      {/* 인사이트 목록 */}
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-2.5 rounded-button
                       bg-white/60 border border-soft-green-100/30"
          >
            <span className="text-lg shrink-0 mt-0.5">{insight.icon}</span>
            <p className="text-sm text-dark-gray leading-relaxed">{insight.message}</p>
          </div>
        ))}
      </div>

      {/* 구분선 — 따뜻한 그라데이션 */}
      <div className="divider-warm my-4" />

      {/* 오늘의 팁 — 하이라이트 카드 */}
      <div className="card-highlight">
        <div className="flex items-start gap-2">
          <span className="text-lg shrink-0">💡</span>
          <div>
            <p className="text-xs font-bold text-sunny-yellow-dark mb-1">오늘의 팁</p>
            <p className="text-sm text-dark-gray leading-relaxed">{todayTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
