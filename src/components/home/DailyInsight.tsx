"use client";

import { PRESET_ANALYSIS } from "@/lib/sample-data";

/**
 * 일간 인사이트 카드 — AI 분석 결과 (프리셋)
 */
export default function DailyInsight() {
  const { insights, todayTip } = PRESET_ANALYSIS.dailyInsight;

  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <h3 className="text-sm font-semibold text-soft-green mb-3">✨ AI 인사이트</h3>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-lg shrink-0">{insight.icon}</span>
            <p className="text-sm text-dark-gray leading-relaxed">{insight.message}</p>
          </div>
        ))}
      </div>

      {/* 오늘의 팁 */}
      <div className="mt-4 pt-3 border-t border-light-gray">
        <div className="bg-sunny-yellow/20 rounded-button px-3 py-2">
          <p className="text-xs font-semibold text-dark-gray">💡 오늘의 팁</p>
          <p className="text-sm text-dark-gray mt-1">{todayTip}</p>
        </div>
      </div>
    </div>
  );
}
