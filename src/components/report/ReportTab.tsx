"use client";

import { useStore } from "@/store/useStore";
import { DOMAIN_LABELS, DomainKey } from "@/types";
import RadarChart from "./RadarChart";

/**
 * 주간 리포트 탭 — 레이더 차트 + 하이라이트 + 발달 구간
 */
export default function ReportTab() {
  const { child, weeklyReport } = useStore();
  const childName = child?.nickname || "아이";

  if (!weeklyReport) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-3xl mb-2">📊</p>
        <p className="text-mid-gray">기록이 쌓이면 주간 리포트가 생성돼요!</p>
      </div>
    );
  }

  const trendIcon = (trend: "up" | "stable" | "down") => {
    switch (trend) {
      case "up": return "↑";
      case "stable": return "→";
      case "down": return "↓";
    }
  };

  const trendColor = (trend: "up" | "stable" | "down") => {
    switch (trend) {
      case "up": return "text-soft-green";
      case "stable": return "text-calm-blue";
      case "down": return "text-soft-coral";
    }
  };

  return (
    <div className="px-5">
      {/* 헤더 */}
      <div className="py-4">
        <h2 className="text-xl font-bold">📊 {childName}의 주간 리포트</h2>
        <p className="text-sm text-mid-gray mt-1">
          {weeklyReport.startDate} ~ {weeklyReport.endDate}
        </p>
      </div>

      {/* 레이더 차트 */}
      <div className="bg-white rounded-card shadow-card p-4 mb-4">
        <RadarChart
          scores={weeklyReport.scores}
          prevScores={weeklyReport.prevScores}
        />
        <div className="flex items-center justify-center gap-6 mt-2 text-xs text-mid-gray">
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-soft-green inline-block" /> 이번 주
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-light-gray inline-block border-dashed" /> 지난 주
          </span>
        </div>
      </div>

      {/* 하이라이트 */}
      <div className="bg-white rounded-card shadow-card p-4 mb-4">
        <h3 className="text-base font-semibold mb-3">⭐ 이번 주 하이라이트</h3>
        <div className="space-y-3">
          {weeklyReport.highlights.map((h, i) => (
            <div key={i} className="bg-sunny-yellow/10 rounded-button px-3 py-2">
              <p className="text-sm text-dark-gray">{h}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 발달 구간 */}
      <div className="bg-white rounded-card shadow-card p-4 mb-4">
        <h3 className="text-base font-semibold mb-3">📈 발달 구간</h3>
        <div className="space-y-2">
          {(Object.keys(weeklyReport.bands) as DomainKey[]).map((key) => {
            const band = weeklyReport.bands[key];
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-light-gray last:border-0">
                <span className="text-sm font-medium">{DOMAIN_LABELS[key]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-dark-gray">{band.band}</span>
                  <span className={`text-sm font-bold ${trendColor(band.trend)}`}>
                    {trendIcon(band.trend)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[10px] text-mid-gray">
          <span>↑ 향상</span>
          <span>→ 유지</span>
          <span>↓ 관심</span>
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="bg-calm-blue/10 rounded-button px-4 py-3 mb-4">
        <p className="text-xs text-calm-blue leading-relaxed">
          ℹ️ 구간은 같은 또래 평균 대비 위치를 나타내요. 점수가 아닌 범위로 보여드려요.
        </p>
      </div>
    </div>
  );
}
