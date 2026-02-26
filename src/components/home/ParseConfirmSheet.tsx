"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { ParsedActivity } from "@/lib/nl-parser";
import { ActivityRecord, ActivityData, ReadingData, QuestionData, EmotionData } from "@/types";

const ACTIVITY_CATEGORIES = [
  { value: "퍼즐", emoji: "🧩" },
  { value: "블록", emoji: "🏗️" },
  { value: "학습", emoji: "✏️" },
  { value: "미술", emoji: "🎨" },
  { value: "운동", emoji: "🏃" },
  { value: "기타", emoji: "📝" },
];

const EMOTION_OPTIONS = [
  { emoji: "😊", label: "행복" },
  { emoji: "😐", label: "보통" },
  { emoji: "😤", label: "짜증" },
  { emoji: "😢", label: "슬픔" },
  { emoji: "😴", label: "피곤" },
  { emoji: "🤩", label: "신남" },
];

const TYPE_CONFIG = {
  activity: { icon: "timer",        label: "활동",   color: "bg-blue-100 text-blue-600" },
  reading:  { icon: "menu_book",    label: "독서",   color: "bg-emerald-100 text-emerald-600" },
  question: { icon: "chat_bubble",  label: "질문",   color: "bg-purple-100 text-purple-600" },
  emotion:  { icon: "mood",         label: "감정",   color: "bg-orange-100 text-orange-600" },
  photo:    { icon: "photo_camera", label: "사진",   color: "bg-pink-100 text-pink-600" },
};

interface Props {
  activities: ParsedActivity[];
  onClose: () => void;
}

/**
 * 자연어 파싱 결과를 확인/수정하고 일괄 저장하는 바텀시트
 */
export default function ParseConfirmSheet({ activities: initial, onClose }: Props) {
  const addActivity = useStore((s) => s.addActivity);
  const [items, setItems] = useState<ParsedActivity[]>(initial);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const updateItem = (idx: number, patch: Partial<ParsedActivity>) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const saveAll = () => {
    const timestamp = new Date().toISOString();
    items.forEach((parsed, i) => {
      const record: ActivityRecord = {
        id: `act-${Date.now()}-${i}`,
        type: parsed.type,
        timestamp,
        data: parsed.data,
      };
      addActivity(record);
    });
    onClose();
  };

  if (items.length === 0) {
    return (
      <>
        <div className="bottom-sheet-backdrop" onClick={onClose} role="presentation" aria-hidden="true" />
        <div className="bottom-sheet" role="dialog" aria-modal="true" aria-label="파싱 결과">
          <div className="bottom-sheet-handle" />
          <div className="px-5 pb-8 text-center text-mid-gray py-10">
            파싱된 활동이 없습니다.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bottom-sheet-backdrop" onClick={onClose} role="presentation" aria-hidden="true" />

      <div className="bottom-sheet" role="dialog" aria-modal="true" aria-label="기록 확인">
        <div className="bottom-sheet-handle" />

        <div className="px-5 pb-8 max-h-[75vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
                <MaterialIcon name="auto_awesome" size={18} className="text-primary" />
              </div>
              <h3 className="text-base font-bold text-slate-900">기록 확인</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center
                         hover:bg-slate-200 transition-colors"
              aria-label="닫기"
              type="button"
            >
              <MaterialIcon name="close" size={16} className="text-slate-500" />
            </button>
          </div>

          {/* 파싱 항목 목록 */}
          <div className="space-y-3 mb-5">
            {items.map((item, idx) => (
              <ParsedItemCard
                key={idx}
                item={item}
                isEditing={editingIdx === idx}
                onEdit={() => setEditingIdx(editingIdx === idx ? null : idx)}
                onDelete={() => removeItem(idx)}
                onChange={(patch) => updateItem(idx, patch)}
              />
            ))}
          </div>

          {/* 저장 버튼 */}
          <button
            onClick={saveAll}
            className="btn-primary w-full py-3.5 text-base font-bold"
          >
            <MaterialIcon name="check" size={18} className="mr-1.5" />
            모두 기록하기 ({items.length}건)
          </button>
        </div>
      </div>
    </>
  );
}

// ─── 개별 항목 카드 ────────────────────────────────────────────────────────

interface CardProps {
  item: ParsedActivity;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onChange: (patch: Partial<ParsedActivity>) => void;
}

function ParsedItemCard({ item, isEditing, onEdit, onDelete, onChange }: CardProps) {
  const cfg = TYPE_CONFIG[item.type];
  const isLowConfidence = item.confidence < 0.7;
  const isVeryLow = item.confidence < 0.5;

  const borderColor = isVeryLow
    ? "border-rose-300"
    : isLowConfidence
    ? "border-amber-300"
    : "border-slate-100";

  const badge = isVeryLow
    ? <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">수정 필요</span>
    : isLowConfidence
    ? <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">확인 필요</span>
    : null;

  return (
    <div className={`rounded-xl border ${borderColor} bg-white p-3.5 shadow-sm`}>
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
            <MaterialIcon name={cfg.icon} size={11} className="mr-0.5" />
            {cfg.label}
          </span>
          {badge}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            aria-label="수정"
            type="button"
          >
            <MaterialIcon name={isEditing ? "expand_less" : "edit"} size={14} className="text-slate-500" />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-rose-100 transition-colors"
            aria-label="삭제"
            type="button"
          >
            <MaterialIcon name="delete" size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* 요약 표시 */}
      <ActivitySummary item={item} />

      {/* 인라인 수정 폼 */}
      {isEditing && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <ActivityEditForm item={item} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

// ─── 요약 표시 ────────────────────────────────────────────────────────────

function ActivitySummary({ item }: { item: ParsedActivity }) {
  if (item.type === "activity") {
    const d = item.data as ActivityData;
    return (
      <p className="text-sm text-slate-700">
        <span className="font-semibold">{d.category}</span>
        {d.durationMin > 0 && <span className="text-mid-gray ml-1.5">{d.durationMin}분</span>}
      </p>
    );
  }
  if (item.type === "reading") {
    const d = item.data as ReadingData;
    return (
      <p className="text-sm text-slate-700">
        <span className="font-semibold">{d.bookTitle}</span>
        <span className="text-mid-gray ml-1.5">{d.readAlone ? "혼자 읽기" : "같이 읽기"}</span>
        {d.durationMin != null && d.durationMin > 0 && (
          <span className="text-mid-gray ml-1.5">{d.durationMin}분</span>
        )}
      </p>
    );
  }
  if (item.type === "question") {
    const d = item.data as QuestionData;
    return (
      <p className="text-sm text-slate-700 line-clamp-2">
        <span className="font-medium text-purple-700">&ldquo;</span>
        {d.quote}
        <span className="font-medium text-purple-700">&rdquo;</span>
      </p>
    );
  }
  if (item.type === "emotion") {
    const d = item.data as EmotionData;
    return (
      <p className="text-sm text-slate-700">
        <span className="mr-1">{d.emoji}</span>
        <span className="font-semibold">{d.label}</span>
      </p>
    );
  }
  return null;
}

// ─── 인라인 수정 폼 ───────────────────────────────────────────────────────

function ActivityEditForm({
  item,
  onChange,
}: {
  item: ParsedActivity;
  onChange: (patch: Partial<ParsedActivity>) => void;
}) {
  const updateData = (dataPath: Partial<typeof item.data>) => {
    onChange({ data: { ...item.data, ...dataPath } });
  };

  if (item.type === "activity") {
    const d = item.data as ActivityData;
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-mid-gray mb-1.5">카테고리</label>
          <div className="flex flex-wrap gap-1.5">
            {ACTIVITY_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => updateData({ category: cat.value })}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  d.category === cat.value
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary"
                }`}
              >
                {cat.emoji} {cat.value}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-mid-gray mb-1.5">시간 (분)</label>
          <input
            type="number"
            min={0}
            max={600}
            value={d.durationMin || ""}
            onChange={(e) => updateData({ durationMin: parseInt(e.target.value) || 0 })}
            className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="0"
          />
        </div>
      </div>
    );
  }

  if (item.type === "reading") {
    const d = item.data as ReadingData;
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-mid-gray mb-1.5">책 제목</label>
          <input
            type="text"
            value={d.bookTitle}
            onChange={(e) => updateData({ bookTitle: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="책 제목 입력"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateData({ readAlone: !d.readAlone })}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              d.readAlone
                ? "bg-primary text-white border-primary"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            혼자 읽기
          </button>
          <input
            type="number"
            min={0}
            max={600}
            value={d.durationMin ?? ""}
            onChange={(e) => updateData({ durationMin: parseInt(e.target.value) || undefined })}
            className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="시간(분)"
          />
        </div>
      </div>
    );
  }

  if (item.type === "question") {
    const d = item.data as QuestionData;
    return (
      <div>
        <label className="block text-xs font-semibold text-mid-gray mb-1.5">질문 내용</label>
        <textarea
          value={d.quote}
          onChange={(e) => updateData({ quote: e.target.value })}
          rows={2}
          maxLength={500}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800
                     resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="아이가 한 질문을 입력하세요"
        />
      </div>
    );
  }

  if (item.type === "emotion") {
    const d = item.data as EmotionData;
    return (
      <div>
        <label className="block text-xs font-semibold text-mid-gray mb-1.5">감정 선택</label>
        <div className="flex gap-2">
          {EMOTION_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => updateData({ emoji: opt.emoji, label: opt.label })}
              className={`flex flex-col items-center px-2 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                d.label === opt.label
                  ? "bg-primary-50 border-primary text-primary-700"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              <span className="text-base">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
