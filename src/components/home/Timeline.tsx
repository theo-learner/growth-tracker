"use client";

import { useState } from "react";
import Image from "next/image";
import { ActivityRecord, ActivityData, QuestionData, ReadingData, EmotionData, PhotoData } from "@/types";
import { useStore } from "@/store/useStore";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { callApi } from "@/lib/api-client";

/**
 * 오늘 기록 타임라인 — Stitch 카드 스타일
 */
export default function Timeline({ activities }: { activities: ActivityRecord[] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-stitch-card border border-slate-100 p-6 text-center">
        <MaterialIcon name="edit_note" size={36} className="text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">
          아직 오늘 기록이 없어요.
          <br />
          위 버튼을 눌러 기록해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-stitch-card border border-slate-100 overflow-hidden divide-y divide-slate-50">
      {activities.map((act) => (
        <TimelineItem key={act.id} activity={act} />
      ))}
    </div>
  );
}

/** 동일 카테고리 이전 기록과 비교 정보를 계산한다 */
function usePreviousComparison(activity: ActivityRecord) {
  const allActivities = useStore((s) => s.activities);
  if (activity.type !== "activity") return null;

  const current = activity.data as ActivityData;
  if (!current.difficultyLevel) return null;

  // 현재 기록 이전의 같은 카테고리 기록 중 difficultyLevel이 있는 가장 최근 것
  const currentIdx = allActivities.findIndex((a) => a.id === activity.id);
  if (currentIdx === -1) return null;

  const prev = allActivities
    .slice(currentIdx + 1)
    .find(
      (a) =>
        a.type === "activity" &&
        (a.data as ActivityData).category === current.category &&
        (a.data as ActivityData).difficultyLevel != null
    );

  if (!prev) return null;
  const prevData = prev.data as ActivityData;

  return {
    diffDifficulty: current.difficultyLevel - (prevData.difficultyLevel ?? 0),
    diffDuration: current.durationMin - prevData.durationMin,
    unit: current.difficultyUnit ?? "단계",
  };
}

function TimelineItem({ activity }: { activity: ActivityRecord }) {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const deleteActivity = useStore((s) => s.deleteActivity);
  const updateActivity = useStore((s) => s.updateActivity);
  const child = useStore((s) => s.child);
  const comparison = usePreviousComparison(activity);

  const handleAnalyzePhoto = async () => {
    const photoData = activity.data as PhotoData;
    if (!photoData.imageData) return;
    setAnalyzing(true);
    try {
      const result = await callApi("/api/analyze-photo", {
        method: "POST",
        body: JSON.stringify({
          imageData: photoData.imageData,
          note: photoData.note,
          childProfile: child,
        }),
      });
      updateActivity(activity.id, {
        data: { ...photoData, aiAnalysis: result.analysis },
      });
    } catch {
      // 분석 실패 시 무시
    } finally {
      setAnalyzing(false);
    }
  };

  const time = new Date(activity.timestamp).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const { iconName, iconClass, text } = getActivityDisplay(activity);
  const photoData = activity.type === "photo" ? activity.data as PhotoData : null;

  const handleDelete = () => {
    deleteActivity(activity.id);
    setConfirmDelete(false);
    setShowMenu(false);
  };

  return (
    <div className="px-4 py-3 flex items-start gap-3 relative group">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconClass}`}>
        {iconName.startsWith("emoji:") ? (
          <span className="text-lg">{iconName.replace("emoji:", "")}</span>
        ) : (
          <MaterialIcon name={iconName} size={16} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        {activity.isSample && (
          <span className="inline-block px-2 py-0.5 mb-1 text-[10px] font-medium
                         bg-amber-100 text-amber-600 rounded-full">
            샘플
          </span>
        )}
        {photoData?.imageData && (
          <Image
            src={photoData.imageData}
            alt="기록 사진"
            width={200}
            height={200}
            className="w-full max-w-[200px] h-auto rounded-lg mb-2 object-cover"
            unoptimized
          />
        )}
        <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
        {/* 사진 AI 분석 결과 */}
        {photoData?.aiAnalysis && (
          <div className="mt-2 bg-primary-50 border border-primary-100 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MaterialIcon name="auto_awesome" size={12} className="text-primary-600" />
              <span className="text-[10px] font-bold text-primary-600">AI 분석</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{photoData.aiAnalysis}</p>
          </div>
        )}
        {/* AI 분석 버튼 (사진 있고 분석 결과 없을 때만) */}
        {photoData?.imageData && !photoData?.aiAnalysis && (
          <button
            onClick={handleAnalyzePhoto}
            disabled={analyzing}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5
                       bg-primary-50 border border-primary-100 rounded-lg
                       text-xs font-semibold text-primary-600
                       hover:bg-primary-100 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MaterialIcon name="auto_awesome" size={13} />
            {analyzing ? "분석 중..." : "AI 분석하기"}
          </button>
        )}
        {/* 이전 기록 대비 성장 표시 */}
        {comparison && (
          <div className="flex items-center gap-2 mt-1">
            {comparison.diffDifficulty !== 0 && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                comparison.diffDifficulty > 0
                  ? "bg-primary-50 text-primary-700"
                  : "bg-rose-50 text-rose-600"
              }`}>
                <MaterialIcon
                  name={comparison.diffDifficulty > 0 ? "trending_up" : "trending_down"}
                  size={11}
                />
                {comparison.diffDifficulty > 0 ? "+" : ""}{comparison.diffDifficulty}{comparison.unit}
              </span>
            )}
            {comparison.diffDuration !== 0 && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                comparison.diffDuration < 0
                  ? "bg-primary-50 text-primary-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                <MaterialIcon
                  name={comparison.diffDuration < 0 ? "speed" : "hourglass_top"}
                  size={11}
                />
                {comparison.diffDuration > 0 ? "+" : ""}{comparison.diffDuration}분
              </span>
            )}
            <span className="text-[10px] text-slate-400">지난번 대비</span>
          </div>
        )}
        <p className="text-xs text-slate-400 mt-0.5">{time}</p>
      </div>

      {/* 메뉴 버튼 */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="opacity-0 group-hover:opacity-100 transition-opacity
                   w-7 h-7 rounded-full hover:bg-slate-100
                   flex items-center justify-center text-slate-400 shrink-0"
        aria-label="메뉴"
      >
        <MaterialIcon name="more_vert" size={16} />
      </button>

      {/* 드롭다운 메뉴 */}
      {showMenu && (
        <div className="absolute right-4 top-10 bg-white rounded-xl shadow-stitch-card-hover border border-slate-100 z-10 py-1 min-w-[100px]">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full px-4 py-2 text-left text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-2"
            >
              <MaterialIcon name="delete" size={14} />
              삭제
            </button>
          ) : (
            <div className="px-3 py-2">
              <p className="text-xs text-slate-600 mb-2">삭제할까요?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-2 py-1 bg-rose-500 text-white text-xs rounded-lg"
                >
                  확인
                </button>
                <button
                  onClick={() => { setConfirmDelete(false); setShowMenu(false); }}
                  className="flex-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getActivityDisplay(activity: ActivityRecord): { iconName: string; iconClass: string; text: string } {
  switch (activity.type) {
    case "activity": {
      const d = activity.data as ActivityData;
      const diffStr = d.difficultyLevel
        ? ` · ${d.difficultyLevel}${d.difficultyUnit ?? ""}`
        : "";
      return {
        iconName: "timer",
        iconClass: "bg-blue-100 text-blue-600",
        text: `${d.category}${diffStr} — ${d.durationMin}분${d.detail ? ` · ${d.detail}` : ""}`,
      };
    }
    case "question": {
      const d = activity.data as QuestionData;
      return {
        iconName: "chat_bubble",
        iconClass: "bg-purple-100 text-purple-600",
        text: `"${d.quote}"${d.context ? ` (${d.context})` : ""}`,
      };
    }
    case "reading": {
      const d = activity.data as ReadingData;
      return {
        iconName: "menu_book",
        iconClass: "bg-emerald-100 text-emerald-600",
        text: `《${d.bookTitle}》 ${d.durationMin ? `${d.durationMin}분 ` : ""}${d.readAlone ? "혼자 읽음" : "같이 읽음"}`,
      };
    }
    case "emotion": {
      const d = activity.data as EmotionData;
      return {
        // 감정 이모지는 직관성을 위해 유지
        iconName: `emoji:${d.emoji}`,
        iconClass: "bg-orange-50",
        text: `${d.label}${d.note ? ` — ${d.note}` : ""}`,
      };
    }
    case "photo": {
      const d = activity.data as PhotoData;
      return {
        iconName: "photo_camera",
        iconClass: "bg-pink-100 text-pink-600",
        text: `사진 기록${d.note ? ` — ${d.note}` : ""}`,
      };
    }
    default:
      return { iconName: "edit_note", iconClass: "bg-slate-100 text-slate-500", text: "기록" };
  }
}
