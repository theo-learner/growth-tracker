"use client";

import { ActivityRecord, ActivityData, QuestionData, ReadingData, EmotionData, PhotoData } from "@/types";

/**
 * 오늘 기록 타임라인
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
  const time = new Date(activity.timestamp).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const { icon, text } = getActivityDisplay(activity);

  return (
    <div className="px-4 py-3 flex items-start gap-3">
      <span className="text-lg mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-dark-gray leading-relaxed">{text}</p>
        <p className="text-xs text-mid-gray mt-1">{time}</p>
      </div>
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
