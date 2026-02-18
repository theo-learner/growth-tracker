"use client";

import { lazy, Suspense } from "react";
import { useStore } from "@/store/useStore";
import { DOMAIN_LABELS, DomainKey } from "@/types";
const RadarChart = lazy(() => import("./RadarChart"));

/**
 * 주간 리포트 탭 v2 — 통일된 카드 디자인 + 부드러운 레이아웃
 */
export default function ReportTab() {
  const { child, weeklyReport, activities } = useStore();
  const childName = child?.nickname || "아이";
  
  // 샘플 데이터만 있는지 확인
  const hasOnlySampleData = activities.length > 0 && activities.every((a) => a.isSample);

  if (!weeklyReport) {
    return (
      <div className="px-5 py-16 text-center animate-fadeIn">
        <div className="w-20 h-20 mx-auto rounded-full bg-soft-green-50 flex items-center justify-center mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <p className="text-base font-semibold text-dark-gray mb-1">아직 리포트가 없어요</p>
        <p className="text-sm text-mid-gray">기록이 쌓이면 주간 리포트가 생성돼요!</p>
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

  return (
    <div className="px-5 animate-fadeIn">
      {/* 헤더 */}
      <div className="py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-dark-gray">
            📊 {childName}의 주간 리포트
          </h2>
          {hasOnlySampleData && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-600 rounded-full">
              샘플
            </span>
          )}
        </div>
        <p className="text-sm text-mid-gray mt-1">
          {weeklyReport.startDate} ~ {weeklyReport.endDate}
        </p>
      </div>

      {/* 레이더 차트 카드 */}
      <div className="chart-card mb-4">
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-sm text-mid-gray">차트 로딩 중...</div>}>
          <RadarChart
            scores={weeklyReport.scores}
            prevScores={weeklyReport.prevScores}
          />
        </Suspense>
      </div>

      {/* 하이라이트 카드 — 골드 악센트 */}
      <div className="card mb-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #FFF0B8 0%, #F5C542 100%)" }}>
            <span className="text-sm">⭐</span>
          </div>
          <h3 className="text-base font-bold text-dark-gray">이번 주 하이라이트</h3>
        </div>
        <div className="space-y-2.5">
          {weeklyReport.highlights.map((h, i) => (
            <div key={i} className="card-highlight highlight-item">
              <p className="text-sm text-dark-gray leading-relaxed">{h}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 발달 구간 카드 — 도메인별 컬러 악센트 */}
      <div className="card mb-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-soft-green-50 flex items-center justify-center">
            <span className="text-sm">📈</span>
          </div>
          <h3 className="text-base font-bold text-dark-gray">발달 구간</h3>
        </div>
        <div className="space-y-0">
          {(Object.keys(weeklyReport.bands) as DomainKey[]).map((key) => {
            const band = weeklyReport.bands[key];
            return (
              <div key={key} className="report-domain-row">
                <span className="text-sm font-medium text-dark-gray">
                  {DOMAIN_LABELS[key]}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm text-dark-gray font-semibold">
                    {band.band}
                  </span>
                  <span
                    className={`
                      trend-indicator
                      ${band.trend === "up"
                        ? "trend-up"
                        : band.trend === "stable"
                          ? "trend-stable"
                          : "trend-down"
                      }
                    `}
                  >
                    {trendIcon(band.trend)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 범례 — 세련된 스타일 */}
        <div className="mt-4 pt-3 border-t border-light-gray/40
                        flex items-center gap-5 text-[10px] text-mid-gray">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-soft-green" /> 향상
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-calm-blue" /> 유지
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-soft-coral" /> 관심
          </span>
        </div>
      </div>

      {/* 안내 배너 — 프리미엄 스타일 */}
      <div className="info-banner mb-4">
        <div className="flex items-start gap-2.5">
          <span className="text-sm mt-0.5 shrink-0">ℹ️</span>
          <p className="text-xs text-calm-blue-dark leading-relaxed">
            구간은 같은 또래 평균 대비 위치를 나타내요. 점수가 아닌 범위로 보여드려요.
          </p>
        </div>
      </div>
    </div>
  );
}
