"use client";

interface RecordButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

/**
 * 빠른 기록 버튼 — 홈 화면 그리드
 */
export default function RecordButton({ icon, label, onClick }: RecordButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-card shadow-card p-3 flex flex-col items-center gap-1
                 hover:shadow-md active:scale-95 transition-all"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[11px] font-medium text-dark-gray whitespace-pre-line text-center leading-tight">
        {label}
      </span>
    </button>
  );
}
