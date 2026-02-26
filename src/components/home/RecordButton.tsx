"use client";

import MaterialIcon from "@/components/ui/MaterialIcon";

interface RecordButtonProps {
  icon: string;      // Material Symbol name
  label: string;
  color: string;     // 원형 배경 색상 클래스 (예: "bg-blue-100 text-blue-600")
  onClick: () => void;
}

/**
 * Quick Log 원형 버튼 — Stitch 패턴
 */
export default function RecordButton({ icon, label, color, onClick }: RecordButtonProps) {
  return (
    <button
      onClick={onClick}
      className="record-btn group"
      aria-label={`${label} 기록하기`}
      type="button"
    >
      <div className={`record-btn-circle ${color} group-hover:scale-105`}>
        <MaterialIcon name={icon} size={24} />
      </div>
      <span className="record-btn-label">{label}</span>
    </button>
  );
}
