"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import {
  getReminders,
  updateReminder,
  requestNotificationPermission,
  getNotificationPermission,
  startReminderScheduler,
  type Reminder,
} from "@/lib/notifications";
import { exportActivitiesCSV, exportAllDataJSON } from "@/lib/export";
import MaterialIcon from "@/components/ui/MaterialIcon";
import AddChildSheet from "@/components/ui/AddChildSheet";

interface SettingsModalProps {
  onClose: () => void;
}

/**
 * 설정 모달 — 프로필 + 리마인더 + 데이터 초기화
 */
export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { child, children, activeChildId, activities, switchChild, resetAll } = useStore();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifPermission, setNotifPermission] = useState<string>("default");
  const [showAddChild, setShowAddChild] = useState(false);

  useEffect(() => {
    setReminders(getReminders());
    setNotifPermission(getNotificationPermission());
  }, []);

  const handleReset = () => {
    if (confirm("모든 데이터가 삭제됩니다. 처음부터 다시 시작할까요?")) {
      resetAll();
      onClose();
    }
  };

  const handleToggleReminder = async (id: string, enabled: boolean) => {
    if (enabled && notifPermission !== "granted") {
      const granted = await requestNotificationPermission();
      setNotifPermission(granted ? "granted" : "denied");
      if (!granted) {
        alert("알림 권한이 필요합니다. 브라우저 설정에서 허용해주세요.");
        return;
      }
    }
    const updated = updateReminder(id, { enabled });
    setReminders(updated);
    if (enabled) startReminderScheduler();
  };

  const handleTimeChange = (id: string, time: string) => {
    const updated = updateReminder(id, { time });
    setReminders(updated);
  };

  return (
    <>
      {showAddChild && (
        <AddChildSheet onClose={() => setShowAddChild(false)} />
      )}
      <div className="bottom-sheet-backdrop" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 top-20 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[24px] z-50 animate-slideUp overflow-y-auto"
           style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.08), 0 -2px 12px rgba(0,0,0,0.04)" }}>
        <div className="bottom-sheet-handle" />

        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MaterialIcon name="settings" size={20} className="text-primary" />
              <h3 className="text-lg font-bold">설정</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <MaterialIcon name="close" size={18} />
            </button>
          </div>

          {/* 아이 선택 + 추가 (다자녀 지원) */}
          <div className="bg-surface rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <MaterialIcon name="family_restroom" size={16} className="text-primary" />
                아이 관리
              </h4>
              <button
                onClick={() => setShowAddChild(true)}
                className="flex items-center gap-1 text-xs font-medium text-primary
                           px-2.5 py-1 rounded-full border border-primary/30
                           hover:bg-primary/5 transition-colors"
              >
                <MaterialIcon name="add" size={14} />
                아이 추가
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => switchChild(c.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${activeChildId === c.id
                      ? "bg-primary text-white shadow-stitch-btn"
                      : "bg-white border border-slate-200 hover:border-primary/40"
                    }`}
                >
                  {c.nickname}
                </button>
              ))}
            </div>
          </div>

          {/* 아이 정보 */}
          <div className="bg-surface rounded-xl p-4 mb-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <MaterialIcon name="person" size={16} className="text-primary" />
              현재 아이 정보
            </h4>
            <p className="text-sm">이름: {child?.nickname}</p>
            <p className="text-sm">나이: 만 {child?.age}세</p>
            <p className="text-sm">성별: {child?.gender === "female" ? "여아" : child?.gender === "male" ? "남아" : "안 밝힘"}</p>
          </div>

          {/* 리마인더 설정 */}
          <div className="bg-surface rounded-xl p-4 mb-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <MaterialIcon name="notifications" size={16} className="text-primary" />
              알림 리마인더
            </h4>

            {notifPermission === "denied" && (
              <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                <MaterialIcon name="warning" size={12} className="text-red-500" />
                알림이 차단되었습니다. 브라우저 설정에서 허용해주세요.
              </p>
            )}

            {notifPermission === "unsupported" && (
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                <MaterialIcon name="info" size={12} className="text-slate-400" />
                이 브라우저는 알림을 지원하지 않습니다.
              </p>
            )}

            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {reminder.id === "morning" ? "☀️ 아침 알림" : "🌙 저녁 알림"}
                    </p>
                    <input
                      type="time"
                      value={reminder.time}
                      onChange={(e) => handleTimeChange(reminder.id, e.target.value)}
                      disabled={!reminder.enabled}
                      className="mt-1 px-2 py-1 text-sm border border-slate-200 rounded
                               disabled:opacity-50 disabled:bg-gray-100"
                    />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminder.enabled}
                      onChange={(e) => handleToggleReminder(reminder.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer
                                    peer-checked:after:translate-x-full peer-checked:after:border-white
                                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                    after:bg-white after:border-gray-300 after:border after:rounded-full
                                    after:h-5 after:w-5 after:transition-all
                                    peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 데이터 내보내기 */}
          <div className="bg-surface rounded-xl p-4 mb-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <MaterialIcon name="download" size={16} className="text-primary" />
              데이터 내보내기
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => exportActivitiesCSV(activities)}
                className="flex-1 py-2.5 rounded-button font-medium text-sm
                           bg-white border border-slate-200
                           hover:border-primary/40 hover:shadow-stitch-card
                           transition-all"
              >
                📊 CSV 내보내기
              </button>
              <button
                onClick={() => exportAllDataJSON(child, activities)}
                className="flex-1 py-2.5 rounded-button font-medium text-sm
                           bg-white border border-slate-200
                           hover:border-primary/40 hover:shadow-stitch-card
                           transition-all"
              >
                📁 JSON 백업
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              기록 {activities.length}개를 내보낼 수 있어요.
            </p>
          </div>

          {/* 앱 정보 */}
          <div className="bg-surface rounded-xl p-4 mb-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <MaterialIcon name="phone_iphone" size={16} className="text-primary" />
              앱 정보
            </h4>
            <p className="text-sm">버전: MVP 0.2.0</p>
            <p className="text-sm">데이터: localStorage (로컬 저장)</p>
            <p className="text-xs text-slate-500 mt-2">
              이 앱은 PWA로 홈 화면에 설치할 수 있습니다.
            </p>
          </div>

          {/* 데이터 초기화 */}
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-button font-semibold text-sm
                       bg-soft-coral/10 text-soft-coral border border-soft-coral/30
                       hover:bg-soft-coral/20 transition-all flex items-center justify-center gap-2"
          >
            <MaterialIcon name="delete" size={16} />
            모든 데이터 초기화 (처음부터 다시)
          </button>
        </div>
      </div>
    </>
  );
}
