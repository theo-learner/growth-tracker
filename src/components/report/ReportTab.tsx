"use client";

import { lazy, Suspense } from "react";
import { useStore } from "@/store/useStore";
import { DOMAIN_LABELS, DomainKey } from "@/types";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { scoreToPercentile, percentileToBand } from "@/lib/score-engine";

const RadarChart = lazy(() => import("./RadarChart"));

/**
 * 주간 리포트 탭 — Stitch 디자인 (상세 성장 리포트 화면)
 */
export default function ReportTab() {
  const { child, weeklyReport, activities } = useStore();
  const childAge = child?.age ?? 5;
  const childName = child?.nickname || "아이";

  const hasOnlySampleData = activities.length > 0 && activities.every((a) => a.isSample);

  if (!weeklyReport) {
    return (
      <div className="px-5 py-16 text-center animate-fadeIn">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <MaterialIcon name="show_chart" size={36} className="text-primary-300" />
        </div>
        <p className="text-base font-semibold text-dark-gray mb-1">아직 리포트가 없어요</p>
        <p className="text-sm text-mid-gray">기록이 쌓이면 주간 리포트가 생성돼요!</p>
      </div>
    );
  }

  const trendIcon = (trend: "up" | "stable" | "down") =>
    trend === "up" ? "trending_up" : trend === "stable" ? "trending_flat" : "trending_down";

  // 첫 하이라이트는 AI 분석 요약으로, 나머지는 솔루션 카드로
  const [summaryHighlight, ...solutionHighlights] = weeklyReport.highlights;

  return (
    <div className="animate-fadeIn pb-6">
      {/* 헤더 — sticky + backdrop-blur */}
      <div className="sticky top-0 z-10 bg-surface-100/80 backdrop-blur-md border-b border-surface-300/50">
        <div className="flex items-center justify-between px-4 py-4">
          <h2 className="text-lg font-bold text-dark-gray">성장 리포트</h2>
          <div className="flex items-center gap-2">
            {hasOnlySampleData && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-600 rounded-full">
                샘플
              </span>
            )}
            <button
              aria-label="날짜 선택"
              className="w-9 h-9 rounded-full bg-white border border-surface-300/60
                         shadow-stitch-card flex items-center justify-center"
            >
              <MaterialIcon name="calendar_today" size={18} className="text-mid-gray" />
            </button>
          </div>
        </div>
        {/* 날짜 범위 */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          <button className="flex-none px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium whitespace-nowrap">
            {weeklyReport.weekLabel}
          </button>
          <button className="flex-none px-4 py-1.5 rounded-full bg-surface-200 text-mid-gray text-sm font-medium whitespace-nowrap">
            {weeklyReport.startDate} ~ {weeklyReport.endDate}
          </button>
        </div>
      </div>

      <div className="px-4 space-y-6 mt-5">
        {/* AI 분석 요약 카드 */}
        {summaryHighlight && (
          <section className="bg-primary-50 border border-primary-100 rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-start gap-3 relative z-10">
              <div className="bg-primary text-white p-2 rounded-lg shrink-0">
                <MaterialIcon name="auto_awesome" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-primary-700 text-sm mb-1 italic">AI 맞춤 분석 요약</h3>
                <p className="text-dark-gray font-medium leading-relaxed text-sm">
                  <span className="text-primary-700 font-bold">{childName}</span>
                  {summaryHighlight.replace(new RegExp(`^${childName}`), "")}
                </p>
              </div>
            </div>
            {/* 장식 아이콘 */}
            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
              <MaterialIcon name="child_care" size={80} className="text-primary" />
            </div>
          </section>
        )}

        {/* 영역별 발달 분석 — 레이더 차트 */}
        <section>
          <h3 className="text-base font-bold text-dark-gray mb-4 flex items-center gap-2">
            <MaterialIcon name="leaderboard" size={20} className="text-primary" />
            영역별 발달 분석
          </h3>
          <div className="bg-white rounded-xl border border-surface-300/60 shadow-stitch-card p-4">
            <Suspense fallback={
              <div className="h-64 flex items-center justify-center text-sm text-mid-gray">
                차트 로딩 중...
              </div>
            }>
              <RadarChart
                scores={weeklyReport.scores}
                prevScores={weeklyReport.prevScores}
              />
            </Suspense>
          </div>
        </section>

        {/* 발달 구간 상세 */}
        <section>
          <h3 className="text-base font-bold text-dark-gray mb-4 flex items-center gap-2">
            <MaterialIcon name="insights" size={20} className="text-primary" />
            발달 구간
          </h3>
          <div className="bg-white rounded-xl border border-surface-300/60 shadow-stitch-card">
            {(Object.keys(weeklyReport.bands) as DomainKey[]).map((key, i, arr) => {
              const band = weeklyReport.bands[key];
              const percentile = scoreToPercentile(weeklyReport.scores[key], childAge, key);
              const bandLabel = percentileToBand(percentile);
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between px-4 py-3.5
                              ${i < arr.length - 1 ? "border-b border-surface-200" : ""}`}
                >
                  <span className="text-sm font-medium text-dark-gray">{DOMAIN_LABELS[key]}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-dark-gray">{bandLabel}</span>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      band.trend === "up"
                        ? "bg-primary-50 text-primary-600"
                        : band.trend === "stable"
                        ? "bg-surface-200 text-mid-gray"
                        : "bg-rose-50 text-rose-500"
                    }`}>
                      <MaterialIcon name={trendIcon(band.trend)} size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
            {/* 범례 */}
            <div className="px-4 py-3 border-t border-surface-200
                            flex items-center gap-5 text-[10px] text-mid-gray">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> 향상
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-surface-400" /> 유지
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> 관심
              </span>
            </div>
          </div>
        </section>

        {/* AI 맞춤 솔루션 */}
        {solutionHighlights.length > 0 && (
          <section className="pb-2">
            <h3 className="text-base font-bold text-dark-gray mb-4 flex items-center gap-2">
              <MaterialIcon name="lightbulb" size={20} className="text-primary" />
              AI 맞춤 솔루션
            </h3>
            <div className="space-y-3">
              {solutionHighlights.map((highlight, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl
                             border border-surface-300/60 shadow-stitch-card"
                >
                  <div className="w-10 h-10 shrink-0 bg-primary-50 rounded-full
                                  flex items-center justify-center">
                    <MaterialIcon name="auto_stories" size={20} className="text-primary" />
                  </div>
                  <p className="flex-1 text-sm text-dark-gray leading-relaxed">{highlight}</p>
                  <MaterialIcon name="chevron_right" size={20} className="text-surface-400 shrink-0" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 안내 배너 */}
        <div className="rounded-xl px-4 py-3 bg-primary-50 border border-primary-100/60">
          <div className="flex items-start gap-2.5">
            <MaterialIcon name="info" size={14} className="text-primary-600 mt-0.5 shrink-0" />
            <p className="text-xs text-primary-700 leading-relaxed">
              구간은 같은 또래 평균 대비 위치를 나타내요. 점수가 아닌 범위로 보여드려요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
