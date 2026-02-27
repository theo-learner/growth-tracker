"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import RecordButton from "./RecordButton";
import Timeline from "./Timeline";
import RecordSheet from "./RecordSheet";
import DailyInsight from "./DailyInsight";
import KDSTChecklist from "./KDSTChecklist";
import QuickInput from "./QuickInput";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { ActivityType, DomainKey } from "@/types";
import { interpretPercentile, getOverallSummary } from "@/lib/interpretation";
import { scoreToPercentile } from "@/lib/score-engine";

const DOMAIN_LABELS: Record<DomainKey, string> = {
  verbalComprehension: "언어이해",
  visualSpatial: "시공간",
  fluidReasoning: "유동추론",
  workingMemory: "작업기억",
  processingSpeed: "처리속도",
};

const DOMAIN_ICONS: Record<DomainKey, string> = {
  verbalComprehension: "record_voice_over",
  visualSpatial: "visibility",
  fluidReasoning: "psychology",
  workingMemory: "memory",
  processingSpeed: "speed",
};

const RECORD_BUTTONS: { type: ActivityType; icon: string; label: string; color: string }[] = [
  { type: "photo",    icon: "photo_camera", label: "사진",   color: "bg-pink-100 text-pink-600" },
  { type: "activity", icon: "timer",        label: "활동",   color: "bg-blue-100 text-blue-600" },
  { type: "question", icon: "chat_bubble",  label: "질문",   color: "bg-purple-100 text-purple-600" },
  { type: "reading",  icon: "menu_book",    label: "독서",   color: "bg-emerald-100 text-emerald-600" },
  { type: "emotion",  icon: "mood",         label: "감정",   color: "bg-orange-100 text-orange-600" },
];

/**
 * 홈 탭 v3 — Stitch 디자인 적용
 * 프로필, AI Daily Note, Growth at a Glance, Quick Logs, 타임라인
 */
export default function HomeTab() {
  const { child, activities, weeklyReport } = useStore();
  const [activeSheet, setActiveSheet] = useState<ActivityType | null>(null);

  // D+N 계산
  const daysCount = useMemo(() => {
    if (!child?.createdAt) return 1;
    const diff = Date.now() - new Date(child.createdAt).getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
  }, [child]);

  // 오늘 기록만 필터
  const todayStr = new Date().toDateString();
  const todayActivities = activities.filter(
    (a) => new Date(a.timestamp).toDateString() === todayStr
  );

  // 전 발달 영역 (점수 높은 순)
  const allDomains = useMemo(() => {
    if (!weeklyReport?.scores) return [];
    return (Object.entries(weeklyReport.scores) as [DomainKey, number][]).sort(
      ([, a], [, b]) => b - a
    );
  }, [weeklyReport]);

  // 종합 상태
  const overallSummary = useMemo(() => {
    if (!weeklyReport?.scores) return null;
    return getOverallSummary(weeklyReport.scores);
  }, [weeklyReport]);

  // 영역별 트렌드 계산
  const getDomainTrend = (key: DomainKey): "up" | "stable" | "down" => {
    if (!weeklyReport) return "stable";
    const curr = weeklyReport.scores[key];
    const prev = weeklyReport.prevScores[key];
    if (curr > prev + 3) return "up";
    if (curr < prev - 3) return "down";
    return "stable";
  };

  const GENDER_AVATAR: Record<string, string> = {
    female: "👧",
    male: "👦",
    unknown: "🧒",
  };
  const avatarEmoji = GENDER_AVATAR[child?.gender ?? "unknown"] ?? "🧒";

  return (
    <div className="px-5 pb-4">
      {/* 아이 프로필 영역 */}
      <div className="flex flex-col items-center py-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full
                          bg-gradient-to-br from-primary-100 to-primary-200
                          border-4 border-white shadow-float
                          flex items-center justify-center text-5xl">
            {avatarEmoji}
          </div>
          {/* D+N 뱃지 — 우하단 */}
          <div className="absolute bottom-1 right-0
                          bg-primary-50 border border-primary-100
                          px-2.5 py-1 rounded-full
                          flex items-center gap-1 shadow-stitch-card">
            <MaterialIcon name="favorite" size={11} className="text-primary" filled />
            <span className="text-[11px] font-bold text-primary-700">D+{daysCount}</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-dark-gray mt-4">{child?.nickname}</h2>
        <p className="text-sm text-mid-gray mt-0.5">만 {child?.age}세</p>
      </div>

      {/* AI Daily Note (DailyInsight) */}
      <DailyInsight />

      {/* 이번 주 발달 상태 — 전 5영역 + 안심/주의 해석 */}
      {allDomains.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-dark-gray">이번 주 발달 상태</h3>
            <span className="text-xs font-semibold text-primary-600 cursor-default">
              {weeklyReport?.weekLabel}
            </span>
          </div>

          {/* 종합 상태 배너 */}
          {overallSummary && (
            <div className={`rounded-xl px-4 py-3 mb-3 flex items-center gap-2 border ${
              overallSummary.level === "good"
                ? "bg-primary-50 border-primary-100"
                : overallSummary.level === "normal"
                  ? "bg-amber-50 border-amber-100"
                  : "bg-rose-50 border-rose-100"
            }`}>
              <span className="text-lg">{overallSummary.emoji}</span>
              <p className="text-sm font-semibold text-dark-gray">{overallSummary.message}</p>
            </div>
          )}

          {/* 영역별 리스트 */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-stitch-card divide-y divide-slate-50">
            {allDomains.map(([key, score]) => {
              const trend = getDomainTrend(key);
              const prevScore = weeklyReport?.prevScores[key] ?? score;
              const diff = score - prevScore;
              const age = child?.age ?? 5;
              const percentile = scoreToPercentile(score, age, key);
              const interp = interpretPercentile(percentile);
              return (
                <div key={key} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-9 h-9 rounded-xl ${interp.bgColor} flex items-center justify-center shrink-0`}>
                    <MaterialIcon name={DOMAIN_ICONS[key]} size={18} className={interp.textColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark-gray">{DOMAIN_LABELS[key]}</p>
                    <p className={`text-xs font-medium ${interp.textColor}`}>
                      {interp.emoji} {interp.message}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-dark-gray">
                      상위 {100 - percentile}<span className="text-xs font-normal text-mid-gray">%</span>
                    </p>
                    <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                      trend === "up" ? "text-primary-600" : trend === "down" ? "text-rose-500" : "text-mid-gray"
                    }`}>
                      <MaterialIcon
                        name={trend === "up" ? "trending_up" : trend === "down" ? "trending_down" : "trending_flat"}
                        size={12}
                      />
                      {diff !== 0 ? `${diff > 0 ? "+" : ""}${diff}점` : "유지"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* K-DST 발달 체크리스트 */}
      <div className="mt-5">
        <KDSTChecklist />
      </div>

      {/* Quick Input — 자연어 활동 기록 */}
      <div className="mt-5">
        <h3 className="text-base font-bold text-dark-gray mb-3">AI 기록</h3>
        <QuickInput />
      </div>

      {/* Quick Logs — 가로 스크롤 원형 버튼 */}
      <div className="mt-5">
        <h3 className="text-base font-bold text-dark-gray mb-3">Quick Logs</h3>
        <div className="flex gap-4 overflow-x-auto pb-1 hide-scrollbar">
          {RECORD_BUTTONS.map((btn) => (
            <RecordButton
              key={btn.type}
              icon={btn.icon}
              label={btn.label}
              color={btn.color}
              onClick={() => setActiveSheet(btn.type)}
            />
          ))}
        </div>
      </div>

      {/* 오늘 기록 타임라인 */}
      <div className="mt-5">
        <h3 className="text-base font-bold text-dark-gray mb-3">
          오늘 기록 {todayActivities.length > 0 && (
            <span className="text-sm font-normal text-mid-gray">({todayActivities.length})</span>
          )}
        </h3>
        <Timeline activities={todayActivities} />
      </div>

      {/* 기록 바텀시트 */}
      {activeSheet && (
        <RecordSheet type={activeSheet} onClose={() => setActiveSheet(null)} />
      )}
    </div>
  );
}
