"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";

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

// 프리셋 fallback
const FALLBACK_ANALYSIS: AnalysisResult = {
  insights: [
    { type: "progress", icon: "📈", message: "오늘 기록을 분석하고 있어요...", domain: "" },
  ],
  todayTip: "아이와 함께하는 모든 활동이 성장의 기회예요!",
};

/**
 * 일간 인사이트 카드 — AI 분석 API 연동
 */
export default function DailyInsight() {
  const activities = useStore((s) => s.activities);
  const child = useStore((s) => s.child);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 오늘 활동만 필터링
  const todayStr = new Date().toISOString().split("T")[0];
  const todayActivities = activities.filter((a) => a.timestamp.startsWith(todayStr));
  
  // 샘플 데이터 여부 확인
  const hasOnlySampleData = todayActivities.length > 0 && todayActivities.every((a) => a.isSample);

  // 활동이 있을 때 분석 API 호출
  useEffect(() => {
    if (todayActivities.length === 0) {
      setAnalysis(null);
      return;
    }

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activities: todayActivities,
            childProfile: child,
          }),
        });
        if (!res.ok) throw new Error("분석 실패");
        const data = await res.json();
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

  // 기록이 없으면 안내 메시지
  if (todayActivities.length === 0) {
    return (
      <div className="card-insight">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-soft-green/15 flex items-center justify-center">
            <span className="text-sm">✨</span>
          </div>
          <h3 className="text-sm font-bold text-soft-green-600">AI 인사이트</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm text-mid-gray">
            오늘 첫 기록을 남기면<br />AI가 인사이트를 알려드려요!
          </p>
        </div>
      </div>
    );
  }

  const displayAnalysis = analysis || FALLBACK_ANALYSIS;

  return (
    <div className="card-insight">
      {/* 헤더 — 뱃지 스타일 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-soft-green/15 flex items-center justify-center">
          <span className="text-sm">✨</span>
        </div>
        <h3 className="text-sm font-bold text-soft-green-600">AI 인사이트</h3>
        {loading && (
          <span className="text-xs text-mid-gray animate-pulse">분석 중...</span>
        )}
        {hasOnlySampleData && (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-600 rounded-full">
            샘플 데이터 기반
          </span>
        )}
      </div>

      {/* 인사이트 목록 */}
      <div className="space-y-3">
        {displayAnalysis.insights.map((insight, i) => (
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
            <p className="text-sm text-dark-gray leading-relaxed">{displayAnalysis.todayTip}</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
