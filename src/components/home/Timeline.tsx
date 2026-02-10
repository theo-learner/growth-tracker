"use client";

import { useState } from "react";
import { ActivityRecord, ActivityData, QuestionData, ReadingData, EmotionData, PhotoData } from "@/types";
import { useStore } from "@/store/useStore";

/**
 * 오늘 기록 타임라인 — 삭제 기능 포함
 */
export default function Timeline({ activities }: { activities: ActivityRecord[] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-card shadow-card p-6 text-center">
        <p className="text-3xl mb-2">📝</p>
        <p className="text-sm text-mid-gray">
          아직 오늘 기록이 없어요.
          <br />
          위 버튼을 눌러 기록해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden divide-y divide-light-gray">
      {activities.map((act) => (
        <TimelineItem key={act.id} activity={act} />
      ))}
    </div>
  );
}

function TimelineItem({ activity }: { activity: ActivityRecord }) {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteActivity = useStore((s) => s.deleteActivity);

  const time = new Date(activity.timestamp).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const { icon, text } = getActivityDisplay(activity);
  const photoData = activity.type === "photo" ? activity.data as PhotoData : null;

  const handleDelete = () => {
    deleteActivity(activity.id);
    setConfirmDelete(false);
    setShowMenu(false);
  };

  return (
    <div className="px-4 py-3 flex items-start gap-3 relative group">
      <span className="text-lg mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        {/* 샘플 데이터 뱃지 */}
        {activity.isSample && (
          <span className="inline-block px-2 py-0.5 mb-1 text-[10px] font-medium 
                         bg-amber-100 text-amber-600 rounded-full">
            샘플
          </span>
        )}
        {/* 사진 미리보기 */}
        {photoData?.imageData && (
          <img 
            src={photoData.imageData} 
            alt="기록 사진" 
            className="w-full max-w-[200px] h-auto rounded-lg mb-2 object-cover"
          />
        )}
        <p className="text-sm text-dark-gray leading-relaxed">{text}</p>
        <p className="text-xs text-mid-gray mt-1">{time}</p>
      </div>
      
      {/* 메뉴 버튼 */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="opacity-0 group-hover:opacity-100 transition-opacity
                   w-7 h-7 rounded-full hover:bg-gray-100 
                   flex items-center justify-center text-gray-400"
      >
        ⋮
      </button>

      {/* 드롭다운 메뉴 */}
      {showMenu && (
        <div className="absolute right-4 top-10 bg-white rounded-lg shadow-lg border z-10 py-1 min-w-[100px]">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
            >
              🗑️ 삭제
            </button>
          ) : (
            <div className="px-3 py-2">
              <p className="text-xs text-gray-600 mb-2">삭제할까요?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded"
                >
                  확인
                </button>
                <button
                  onClick={() => { setConfirmDelete(false); setShowMenu(false); }}
                  className="flex-1 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded"
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

function getActivityDisplay(activity: ActivityRecord): { icon: string; text: string } {
  switch (activity.type) {
    case "activity": {
      const d = activity.data as ActivityData;
      return { icon: "⏱️", text: `${d.category} — ${d.durationMin}분${d.detail ? ` · ${d.detail}` : ""}` };
    }
    case "question": {
      const d = activity.data as QuestionData;
      return { icon: "💬", text: `"${d.quote}"${d.context ? ` (${d.context})` : ""}` };
    }
    case "reading": {
      const d = activity.data as ReadingData;
      return {
        icon: "📖",
        text: `《${d.bookTitle}》 ${d.durationMin ? `${d.durationMin}분 ` : ""}${d.readAlone ? "혼자 읽음" : "같이 읽음"}`,
      };
    }
    case "emotion": {
      const d = activity.data as EmotionData;
      return { icon: d.emoji, text: `${d.label}${d.note ? ` — ${d.note}` : ""}` };
    }
    case "photo": {
      const d = activity.data as PhotoData;
      return { icon: "📸", text: `사진 기록${d.note ? ` — ${d.note}` : ""}` };
    }
    default:
      return { icon: "📝", text: "기록" };
  }
}
