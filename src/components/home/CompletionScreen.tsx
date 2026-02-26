"use client";

import { useEffect } from "react";
import { ActivityRecord, ActivityType, ActivityData } from "@/types";
import { getActivityTip } from "@/lib/activity-tips";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface Props {
  record: ActivityRecord;
  onClose: () => void;
}

const TYPE_LABELS: Record<ActivityType, string> = {
  photo: "사진",
  activity: "활동",
  question: "질문",
  reading: "독서",
  emotion: "감정",
};

export default function CompletionScreen({ record, onClose }: Props) {
  const category =
    record.type === "activity"
      ? (record.data as ActivityData).category
      : undefined;
  const tip = getActivityTip(record.type, category);

  // 3초 후 자동 닫힘
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="px-5 py-8 flex flex-col items-center text-center">
      {/* 성공 아이콘 */}
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <MaterialIcon name="check_circle" size={40} className="text-primary" filled />
      </div>

      <h3 className="text-lg font-bold text-dark-gray">기록 완료!</h3>
      <p className="text-sm text-mid-gray mt-1">
        {TYPE_LABELS[record.type]} 기록이 저장됐어요
      </p>

      {/* 팁 카드 */}
      <div className="w-full bg-primary-50 border border-primary-100 rounded-xl p-4 mt-5 text-left">
        <div className="flex items-start gap-2">
          <MaterialIcon name="lightbulb" size={16} className="text-primary-600 mt-0.5 shrink-0" filled />
          <p className="text-sm text-dark-gray leading-relaxed">{tip.tip}</p>
        </div>
      </div>

      {/* 다음 활동 추천 */}
      <div className="w-full bg-white border border-slate-100 rounded-xl p-4 mt-3 text-left shadow-stitch-card">
        <p className="text-[10px] font-bold text-mid-gray uppercase tracking-wide mb-1.5">다음에 해볼 활동</p>
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0">{tip.nextActivity.icon}</span>
          <div>
            <p className="text-sm font-bold text-dark-gray">{tip.nextActivity.title}</p>
            <p className="text-xs text-mid-gray mt-0.5">{tip.nextActivity.description}</p>
          </div>
        </div>
      </div>

      {/* 확인 버튼 */}
      <button
        onClick={onClose}
        className="btn-primary mt-6 flex items-center justify-center gap-2"
      >
        <MaterialIcon name="done" size={18} />
        확인
      </button>

      {/* 자동 닫힘 안내 */}
      <p className="text-xs text-mid-gray mt-3">3초 후 자동으로 닫혀요</p>
    </div>
  );
}
