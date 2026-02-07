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
      {/* 아이 프로필 영역 */}
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-soft-green/20 flex items-center justify-center text-3xl mb-2">
          {child?.gender === "female" ? "👧" : child?.gender === "male" ? "👦" : "🧒"}
        </div>
        <h2 className="text-xl font-bold">{child?.nickname}</h2>
        <p className="text-sm text-mid-gray">만 {child?.age}세</p>
        <p className="text-sm text-soft-green font-semibold mt-1">
          🌱 D+{daysCount} 함께 성장한 날
        </p>
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
