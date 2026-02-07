"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import RecordButton from "./RecordButton";
import Timeline from "./Timeline";
import RecordSheet from "./RecordSheet";
import DailyInsight from "./DailyInsight";
import { ActivityType } from "@/types";

/**
 * 홈 탭 — 오늘의 기록 + 타임라인
 */
export default function HomeTab() {
  const { child, activities } = useStore();
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

  const RECORD_BUTTONS: { type: ActivityType; icon: string; label: string }[] = [
    { type: "photo", icon: "📸", label: "사진\n올리기" },
    { type: "activity", icon: "⏱️", label: "활동\n기록" },
    { type: "question", icon: "💬", label: "아이\n질문" },
    { type: "reading", icon: "📖", label: "독서\n기록" },
    { type: "emotion", icon: "😤", label: "감정\n메모" },
  ];

  return (
    <div className="px-5">
      {/* 아이 프로필 영역 — 따뜻한 아바타 + 카운터 */}
      <div className="text-center py-5">
        <div className="relative inline-block mb-3">
          <div className="w-[72px] h-[72px] mx-auto rounded-full
                          bg-gradient-to-br from-soft-green-50 to-soft-green-100
                          border-2 border-soft-green-200/40
                          shadow-card-green
                          flex items-center justify-center text-3xl">
            {child?.gender === "female" ? "👧" : child?.gender === "male" ? "👦" : "🧒"}
          </div>
          {/* 성장 잎사귀 장식 */}
          <span className="absolute -top-0.5 -right-0.5 text-base animate-float">🌱</span>
        </div>
        <h2 className="text-xl font-bold text-dark-gray">{child?.nickname}</h2>
        <p className="text-sm text-mid-gray mt-0.5">만 {child?.age}세</p>
        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-badge
                        bg-soft-green-50 border border-soft-green-100/50">
          <span className="text-xs">🌱</span>
          <span className="text-xs font-bold text-soft-green-600">D+{daysCount}</span>
          <span className="text-xs text-soft-green-500">함께 성장한 날</span>
        </div>
      </div>

      {/* 일간 인사이트 카드 */}
      <DailyInsight />

      {/* 오늘의 기록 섹션 */}
      <div className="mt-6">
        <h3 className="text-base font-semibold mb-3">오늘의 기록</h3>

        {/* 5개 빠른 기록 버튼 */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {RECORD_BUTTONS.map((btn) => (
            <RecordButton
              key={btn.type}
              icon={btn.icon}
              label={btn.label}
              onClick={() => setActiveSheet(btn.type)}
            />
          ))}
        </div>
      </div>

      {/* 오늘 기록 타임라인 */}
      <div>
        <h3 className="text-base font-semibold mb-3">
          오늘 기록한 것들 {todayActivities.length > 0 && `(${todayActivities.length})`}
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
