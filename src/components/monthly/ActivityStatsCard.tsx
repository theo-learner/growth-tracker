"use client";

import { useState, useMemo, lazy, Suspense } from "react";
import { useStore } from "@/store/useStore";
import { summarizeActivities } from "@/lib/activity-summary";
import MaterialIcon from "@/components/ui/MaterialIcon";

const ActivityBarChart = lazy(() => import("./ActivityBarChart"));

type Period = 7 | 30;

/**
 * 활동 통계 대시보드 카드 — 주간/월간 카테고리별 집계
 */
export default function ActivityStatsCard() {
  const { activities } = useStore();
  const [period, setPeriod] = useState<Period>(7);
  const [metric, setMetric] = useState<"count" | "minutes">("count");

  const summary = useMemo(
    () => summarizeActivities(activities, period),
    [activities, period]
  );

  const chartData = useMemo(
    () =>
      Object.entries(summary.categoryBreakdown)
        .map(([category, data]) => ({
          category,
          count: data.count,
          minutes: data.totalMinutes,
        }))
        .sort((a, b) => b[metric] - a[metric]),
    [summary, metric]
  );

  const hasData =
    summary.totalActivities > 0 ||
    summary.readingStats.count > 0 ||
    summary.questionStats.count > 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-dark-gray flex items-center gap-2">
          <MaterialIcon name="bar_chart" size={20} className="text-primary" />
          활동 통계
        </h3>
        {/* 주간/월간 토글 */}
        <div className="flex rounded-full border border-surface-300 overflow-hidden text-xs font-medium">
          {([7, 30] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 transition-colors ${
                period === p
                  ? "bg-primary text-white"
                  : "bg-white text-mid-gray hover:text-dark-gray"
              }`}
            >
              {p === 7 ? "주간" : "월간"}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-xl border border-surface-300/60 shadow-stitch-card px-5 py-10 text-center">
          <MaterialIcon name="fitness_center" size={36} className="text-surface-400 mx-auto mb-3" />
          <p className="text-sm text-mid-gray">
            {period === 7 ? "최근 7일" : "최근 30일"}간 기록된 활동이 없어요.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-300/60 shadow-stitch-card p-4 space-y-5">
          {/* 총 활동 요약 */}
          <div className="flex gap-3">
            <div className="flex-1 bg-primary-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-primary-700">
                {summary.totalActivities + summary.readingStats.count + summary.questionStats.count + summary.photoCount + Object.values(summary.emotionBreakdown).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-xs text-primary-600 mt-0.5">전체 기록</div>
            </div>
            {summary.readingStats.count > 0 && (
              <div className="flex-1 bg-surface rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-dark-gray">
                  {summary.readingStats.count}
                </div>
                <div className="text-xs text-mid-gray mt-0.5">📖 독서</div>
              </div>
            )}
            {summary.questionStats.count > 0 && (
              <div className="flex-1 bg-surface rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-dark-gray">
                  {summary.questionStats.count}
                </div>
                <div className="text-xs text-mid-gray mt-0.5">❓ 질문</div>
              </div>
            )}
          </div>

          {/* 카테고리별 바차트 */}
          {chartData.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-dark-gray">놀이 카테고리별</span>
                <div className="flex rounded-full border border-surface-300 overflow-hidden text-[11px] font-medium">
                  {(["count", "minutes"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMetric(m)}
                      className={`px-2.5 py-1 transition-colors ${
                        metric === m
                          ? "bg-primary text-white"
                          : "bg-white text-mid-gray"
                      }`}
                    >
                      {m === "count" ? "횟수" : "시간"}
                    </button>
                  ))}
                </div>
              </div>
              <Suspense
                fallback={
                  <div className="h-24 flex items-center justify-center text-xs text-mid-gray">
                    차트 로딩 중...
                  </div>
                }
              >
                <ActivityBarChart data={chartData} metric={metric} />
              </Suspense>
            </div>
          )}

          {/* 감정 분포 */}
          {Object.keys(summary.emotionBreakdown).length > 0 && (
            <div>
              <span className="text-xs font-semibold text-dark-gray block mb-2">감정 기록</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(summary.emotionBreakdown).map(([label, count]) => (
                  <span
                    key={label}
                    className="px-2.5 py-1 rounded-full bg-surface text-xs font-medium text-dark-gray"
                  >
                    {label} · {count}회
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 독서 목록 */}
          {summary.readingStats.titles.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-dark-gray block mb-2">읽은 책</span>
              <div className="flex flex-wrap gap-2">
                {summary.readingStats.titles.map((title) => (
                  <span
                    key={title}
                    className="px-2.5 py-1 rounded-full bg-primary-50 text-xs font-medium text-primary-700"
                  >
                    📖 {title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
