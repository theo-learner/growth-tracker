"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import RecordButton from "./RecordButton";
import Timeline from "./Timeline";
import RecordSheet from "./RecordSheet";
import DailyInsight from "./DailyInsight";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { ActivityType, DomainKey } from "@/types";

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

  // 상위 2개 발달 영역 추출
  const topDomains = useMemo(() => {
    if (!weeklyReport?.scores) return [];
    return (Object.entries(weeklyReport.scores) as [DomainKey, number][])
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);
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
      <div className="text-center py-6">
        <div className="relative inline-block mb-3">
          <div className="w-24 h-24 mx-auto rounded-full
                          bg-gradient-to-br from-primary-100 to-primary-200
                          border-4 border-white
                          shadow-stitch-card
                          flex items-center justify-center text-4xl">
            {avatarEmoji}
          </div>
          {/* D+N 뱃지 */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2
                          bg-primary-50 border border-primary-100
                          px-2.5 py-0.5 rounded-full
                          flex items-center gap-1 whitespace-nowrap shadow-stitch-card">
            <MaterialIcon name="favorite" size={12} className="text-primary" filled />
            <span className="text-[11px] font-bold text-primary-700">D+{daysCount}</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-2">{child?.nickname}</h2>
        <p className="text-sm text-slate-500 mt-0.5">만 {child?.age}세</p>
      </div>

      {/* AI Daily Note (DailyInsight) */}
      <DailyInsight />

      {/* Growth at a Glance — 상위 2개 발달 영역 */}
      {topDomains.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">이번 주 발달</h3>
            <span className="text-xs font-semibold text-primary-600 cursor-default">
              {weeklyReport?.weekLabel}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {topDomains.map(([key, score]) => {
              const trend = getDomainTrend(key);
              const prevScore = weeklyReport?.prevScores[key] ?? score;
              const diff = score - prevScore;
              return (
                <div key={key}
                  className="bg-white rounded-xl border border-slate-100 shadow-stitch-card p-4 flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <MaterialIcon name={DOMAIN_ICONS[key]} size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                      {DOMAIN_LABELS[key]}
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      {score}<span className="text-sm font-normal text-slate-400 ml-0.5">점</span>
                    </p>
                  </div>
                  <div className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    trend === "up" ? "text-primary-600" : trend === "down" ? "text-rose-500" : "text-slate-400"
                  }`}>
                    <MaterialIcon
                      name={trend === "up" ? "trending_up" : trend === "down" ? "trending_down" : "trending_flat"}
                      size={14}
                    />
                    {diff !== 0
                      ? `${diff > 0 ? "+" : ""}${diff}점`
                      : "변화 없음"
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Logs — 가로 스크롤 원형 버튼 */}
      <div className="mt-5">
        <h3 className="text-base font-bold text-slate-900 mb-3">빠른 기록</h3>
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
        <h3 className="text-base font-bold text-slate-900 mb-3">
          오늘 기록 {todayActivities.length > 0 && (
            <span className="text-sm font-normal text-slate-400">({todayActivities.length})</span>
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
