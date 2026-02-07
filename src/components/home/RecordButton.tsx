"use client";

interface RecordButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

/**
 * 빠른 기록 버튼 v3 — 아이콘 + 라벨 정렬 개선, 터치 피드백 강화
 */
export default function RecordButton({ icon, label, onClick }: RecordButtonProps) {
  return (
    <button
      onClick={onClick}
      className="record-btn group"
    >
      {/* 아이콘 — 호버/터치시 살짝 스케일 */}
      <span className="text-2xl record-btn-icon group-hover:scale-110 transition-transform duration-200">
        {icon}
      </span>
      {/* 라벨 — 가운데 정렬, 읽기 쉬운 크기 */}
      <span className="text-[11px] font-semibold text-dark-gray/80 group-hover:text-dark-gray
                        whitespace-pre-line text-center leading-tight
                        transition-colors duration-200">
        {label}
      </span>
    </button>
  );
}
