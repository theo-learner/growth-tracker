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
import { useCountUp } from "@/lib/use-count-up";

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
  { type: "photo",    icon: "photo_camera", label: "사진",   color: "bg-domain-processingSpeed-bg text-domain-processingSpeed" },
  { type: "activity", icon: "timer",        label: "활동",   color: "bg-domain-verbalComprehension-bg text-domain-verbalComprehension" },
  { type: "question", icon: "chat_bubble",  label: "질문",   color: "bg-domain-visualSpatial-bg text-domain-visualSpatial" },
  { type: "reading",  icon: "menu_book",    label: "독서",   color: "bg-domain-fluidReasoning-bg text-domain-fluidReasoning" },
  { type: "emotion",  icon: "mood",         label: "감정",   color: "bg-domain-workingMemory-bg text-domain-workingMemory" },
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
    <div className="relative px-5 pb-4 overflow-hidden">
      {/* 성장 메타포 SVG — 홈 상단 장식 */}
      <div
        className="absolute top-0 left-0 right-0 h-72 pointer-events-none select-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 390 288"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="bgFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8f7fd" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#f6f7f8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="leftStem" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#4BBFA0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2bbdee" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {/* 배경 wash */}
          <rect width="390" height="288" fill="url(#bgFade)" />

          {/* 좌측 성장 줄기 — 가장자리에서 올라오는 새싹 */}
          <path
            d="M 38 288 C 38 250, 32 220, 36 185 C 40 150, 48 125, 42 88"
            stroke="url(#leftStem)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* 좌측 왼쪽 잎 */}
          <path
            d="M 37 192 C 10 175, -2 145, 14 122 C 22 152, 32 175, 37 192 Z"
            fill="#4BBFA0"
            fillOpacity="0.35"
          />
          {/* 좌측 오른쪽 잎 */}
          <path
            d="M 40 155 C 68 138, 82 112, 68 90 C 57 116, 46 138, 40 155 Z"
            fill="#2bbdee"
            fillOpacity="0.32"
          />
          {/* 좌측 꽃봉오리 */}
          <circle cx="42" cy="86" r="6" fill="#2bbdee" fillOpacity="0.45" />
          <circle cx="52" cy="76" r="4" fill="#4BBFA0" fillOpacity="0.38" />
          <circle cx="34" cy="72" r="3" fill="#9B72CF" fillOpacity="0.30" />

          {/* 우상단 장식 버블 군 */}
          <circle cx="368" cy="40" r="48" fill="#4BBFA0" fillOpacity="0.08" />
          <circle cx="355" cy="18" r="22" fill="#2bbdee" fillOpacity="0.10" />
          <circle cx="380" cy="68" r="14" fill="#9B72CF" fillOpacity="0.08" />
          {/* 우측 점 도트 */}
          <circle cx="345" cy="52" r="4" fill="#2bbdee" fillOpacity="0.25" />
          <circle cx="362" cy="85" r="3" fill="#4BBFA0" fillOpacity="0.22" />
          <circle cx="378" cy="32" r="2.5" fill="#9B72CF" fillOpacity="0.20" />

          {/* 좌상단 버블 */}
          <circle cx="18" cy="28" r="36" fill="#2bbdee" fillOpacity="0.07" />
        </svg>
      </div>

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
            {allDomains.map(([key, score], index) => (
              <DomainRow
                key={key}
                domainKey={key}
                score={score}
                prevScore={weeklyReport?.prevScores[key] ?? score}
                trend={getDomainTrend(key)}
                age={child?.age ?? 5}
                index={index}
              />
            ))}
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

// ─── 도메인 행 컴포넌트 (카운트업 훅을 개별 적용) ───────────────────────────
interface DomainRowProps {
  domainKey: DomainKey;
  score: number;
  prevScore: number;
  trend: "up" | "stable" | "down";
  age: number;
  index: number;
}

function DomainRow({ domainKey, score, prevScore, trend, age, index }: DomainRowProps) {
  const percentile = scoreToPercentile(score, age, domainKey);
  const interp = interpretPercentile(percentile);
  const diff = score - prevScore;

  // 행마다 80ms 스태거 — 순차 카운트업 효과
  const animatedTop = useCountUp(100 - percentile, 900, index * 80);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={`w-9 h-9 rounded-xl ${interp.bgColor} flex items-center justify-center shrink-0`}>
        <MaterialIcon name={DOMAIN_ICONS[domainKey]} size={18} className={interp.textColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-dark-gray">{DOMAIN_LABELS[domainKey]}</p>
        <p className={`text-xs font-medium ${interp.textColor}`}>
          {interp.emoji} {interp.message}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm text-dark-gray">
          상위{" "}
          <span className="font-display-score text-lg leading-none">{animatedTop}</span>
          <span className="text-xs font-normal text-mid-gray">%</span>
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
}
