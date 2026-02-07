"use client";

import { useStore } from "@/store/useStore";

interface SettingsModalProps {
  onClose: () => void;
}

/**
 * 설정 모달 — 프로필 확인 + 데이터 초기화
 */
export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { child, resetAll } = useStore();

  const handleReset = () => {
    if (confirm("모든 데이터가 삭제됩니다. 처음부터 다시 시작할까요?")) {
      resetAll();
      onClose();
    }
  };

  return (
    <>
      <div className="bottom-sheet-backdrop" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 top-20 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[24px] z-50 animate-slideUp"
           style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.08), 0 -2px 12px rgba(0,0,0,0.04)" }}>
        <div className="bottom-sheet-handle" />

        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">⚙️ 설정</h3>
            <button onClick={onClose} className="text-mid-gray text-xl">✕</button>
          </div>

          {/* 아이 정보 */}
          <div className="bg-warm-beige rounded-card p-4 mb-4">
            <h4 className="text-sm font-semibold mb-2">👶 아이 정보</h4>
            <p className="text-sm">이름: {child?.nickname}</p>
            <p className="text-sm">나이: 만 {child?.age}세</p>
            <p className="text-sm">성별: {child?.gender === "female" ? "여아" : child?.gender === "male" ? "남아" : "안 밝힘"}</p>
          </div>

          {/* 앱 정보 */}
          <div className="bg-warm-beige rounded-card p-4 mb-4">
            <h4 className="text-sm font-semibold mb-2">📱 앱 정보</h4>
            <p className="text-sm">버전: MVP 0.1.0 (데모)</p>
            <p className="text-sm">데이터: localStorage (로컬 저장)</p>
            <p className="text-xs text-mid-gray mt-2">
              이 앱은 데모 모드로 동작합니다. 모든 데이터는 이 기기에만 저장됩니다.
            </p>
          </div>

          {/* 데이터 초기화 */}
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-button font-semibold text-sm
                       bg-soft-coral/10 text-soft-coral border border-soft-coral/30
                       hover:bg-soft-coral/20 transition-all"
          >
            🗑️ 모든 데이터 초기화 (처음부터 다시)
          </button>
        </div>
      </div>
    </>
  );
}
