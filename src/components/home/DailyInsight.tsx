"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { callApi } from "@/lib/api-client";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { getOverallSummary } from "@/lib/interpretation";

interface Insight {
  type: string;
  icon: string;
  message: string;
  domain: string;
}

interface AnalysisResult {
  insights: Insight[];
  todayTip: string;
}

const FALLBACK_ANALYSIS: AnalysisResult = {
  insights: [
    { type: "progress", icon: "📈", message: "오늘 기록을 분석하고 있어요...", domain: "" },
  ],
  todayTip: "아이와 함께하는 모든 활동이 성장의 기회예요!",
};

/**
 * AI Daily Note 카드 — Stitch accent-yellow 디자인
 */
export default function DailyInsight() {
  const activities = useStore((s) => s.activities);
  const child = useStore((s) => s.child);
  const weeklyReport = useStore((s) => s.weeklyReport);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayActivities = activities.filter((a) => a.timestamp.startsWith(todayStr));
  const hasOnlySampleData = todayActivities.length > 0 && todayActivities.every((a) => a.isSample);

  useEffect(() => {
    if (todayActivities.length === 0) {
      setAnalysis(null);
      return;
    }

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await callApi("/api/analyze", {
          method: "POST",
          body: JSON.stringify({
            activities: todayActivities,
            childProfile: child,
          }),
        });
        setAnalysis(data);
      } catch {
        setError("분석을 불러오지 못했어요");
        setAnalysis(FALLBACK_ANALYSIS);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayActivities.length]);

  // 기록 없을 때 — 안내 메시지
  if (todayActivities.length === 0) {
    return (
      <div className="bg-accent-yellow border border-accent-yellow-border/60 rounded-xl p-4 flex gap-3">
        <div className="bg-yellow-300/20 p-2 rounded-xl h-fit">
          <MaterialIcon name="auto_awesome" size={20} className="text-accent-yellow-text" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-accent-yellow-text mb-1">AI Daily Note</h4>
          <div className="flex items-center gap-2">
            <MaterialIcon name="edit_note" size={16} className="text-accent-yellow-text/60" />
            <p className="text-sm text-accent-yellow-text/80">
              첫 기록을 남기면 AI가 인사이트를 알려드려요!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayAnalysis = analysis || FALLBACK_ANALYSIS;

  return (
    <div className="bg-accent-yellow border border-accent-yellow-border/60 rounded-xl p-4 flex gap-3">
      <div className="bg-yellow-300/20 p-2 rounded-xl h-fit shrink-0">
        <MaterialIcon name="auto_awesome" size={20} className="text-accent-yellow-text" />
      </div>
      <div className="flex-1 min-w-0">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-sm font-bold text-accent-yellow-text">AI Daily Note</h4>
          {loading && (
            <span className="text-[10px] text-accent-yellow-text/60 animate-pulse">분석 중...</span>
          )}
          {hasOnlySampleData && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-200/60 text-amber-700 rounded-full">
              샘플 기반
            </span>
          )}
        </div>

        {/* 종합 발달 상태 한줄 */}
        {weeklyReport?.scores && (() => {
          const summary = getOverallSummary(weeklyReport.scores);
          return (
            <p className="text-xs font-semibold text-accent-yellow-text/80 mb-2 flex items-center gap-1">
              <span>{summary.emoji}</span>
              <span>{child?.nickname} 이번 주: {summary.message}</span>
            </p>
          );
        })()}

        {/* 인사이트 목록 */}
        <div className="space-y-1.5">
          {displayAnalysis.insights.map((insight, i) => (
            <p key={i} className="text-sm text-accent-yellow-text/80 leading-relaxed">
              {insight.message}
            </p>
          ))}
        </div>

        {/* 오늘의 팁 */}
        {displayAnalysis.todayTip && (
          <div className="mt-3 flex items-start gap-1.5">
            <MaterialIcon name="lightbulb" size={14} className="text-accent-yellow-text shrink-0 mt-0.5" filled />
            <p className="text-xs font-medium text-accent-yellow-text/70 leading-relaxed">
              {displayAnalysis.todayTip}
            </p>
          </div>
        )}

        {error && (
          <p className="text-[10px] text-red-500 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
