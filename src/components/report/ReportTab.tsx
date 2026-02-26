"use client";

import { lazy, Suspense } from "react";
import { useStore } from "@/store/useStore";
import { DOMAIN_LABELS, DomainKey } from "@/types";
import MaterialIcon from "@/components/ui/MaterialIcon";

const RadarChart = lazy(() => import("./RadarChart"));

/**
 * 주간 리포트 탭 v3 — Stitch 디자인 적용
 */
export default function ReportTab() {
  const { child, weeklyReport, activities } = useStore();
  const childName = child?.nickname || "아이";

  const hasOnlySampleData = activities.length > 0 && activities.every((a) => a.isSample);

  if (!weeklyReport) {
    return (
      <div className="px-5 py-16 text-center animate-fadeIn">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <MaterialIcon name="show_chart" size={36} className="text-primary-300" />
        </div>
        <p className="text-base font-semibold text-slate-800 mb-1">아직 리포트가 없어요</p>
        <p className="text-sm text-slate-500">기록이 쌓이면 주간 리포트가 생성돼요!</p>
      </div>
    );
  }

  const trendIcon = (trend: "up" | "stable" | "down") => {
    switch (trend) {
      case "up":     return "trending_up";
      case "stable": return "trending_flat";
      case "down":   return "trending_down";
    }
  };

  return (
    <div className="px-5 animate-fadeIn pb-4">
      {/* 헤더 */}
      <div className="py-5">
        <div className="flex items-center gap-2">
          <MaterialIcon name="show_chart" size={22} className="text-primary" />
          <h2 className="text-xl font-bold text-slate-900">
            {childName}의 주간 리포트
          </h2>
          {hasOnlySampleData && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-600 rounded-full">
              샘플
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {weeklyReport.startDate} ~ {weeklyReport.endDate}
        </p>
      </div>

      {/* 레이더 차트 카드 */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-stitch-card p-4 mb-4">
        <Suspense fallback={
          <div className="h-64 flex items-center justify-center text-sm text-slate-400">
            차트 로딩 중...
          </div>
        }>
          <RadarChart
            scores={weeklyReport.scores}
            prevScores={weeklyReport.prevScores}
          />
        </Suspense>
      </div>

      {/* 하이라이트 카드 */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-stitch-card p-4 mb-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)" }}>
            <MaterialIcon name="stars" size={16} className="text-yellow-700" filled />
          </div>
          <h3 className="text-base font-bold text-slate-900">이번 주 하이라이트</h3>
        </div>
        <div className="space-y-2.5">
          {weeklyReport.highlights.map((h, i) => (
            <div key={i} className="card-highlight highlight-item">
              <p className="text-sm text-slate-700 leading-relaxed">{h}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 발달 구간 카드 */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-stitch-card p-4 mb-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
            <MaterialIcon name="insights" size={16} className="text-primary" />
          </div>
          <h3 className="text-base font-bold text-slate-900">발달 구간</h3>
        </div>
        <div className="space-y-0">
          {(Object.keys(weeklyReport.bands) as DomainKey[]).map((key) => {
            const band = weeklyReport.bands[key];
            return (
              <div key={key} className="report-domain-row">
                <span className="text-sm font-medium text-slate-700">
                  {DOMAIN_LABELS[key]}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm text-slate-800 font-semibold">
                    {band.band}
                  </span>
                  <span className={`trend-indicator ${
                    band.trend === "up" ? "trend-up"
                    : band.trend === "stable" ? "trend-stable"
                    : "trend-down"
                  }`}>
                    <MaterialIcon name={trendIcon(band.trend)} size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="mt-4 pt-3 border-t border-slate-100
                        flex items-center gap-5 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> 향상
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-calm-blue" /> 유지
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-soft-coral" /> 관심
          </span>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="rounded-xl px-4 py-3.5 mb-4 bg-primary-50 border border-primary-100/40">
        <div className="flex items-start gap-2.5">
          <MaterialIcon name="info" size={14} className="text-primary-600 mt-0.5 shrink-0" />
          <p className="text-xs text-primary-700 leading-relaxed">
            구간은 같은 또래 평균 대비 위치를 나타내요. 점수가 아닌 범위로 보여드려요.
          </p>
        </div>
      </div>
    </div>
  );
}
