"use client";

import { useState, useRef } from "react";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { parseNaturalInput, ParsedActivity } from "@/lib/nl-parser";
import { callApi } from "@/lib/api-client";
import ParseConfirmSheet from "./ParseConfirmSheet";

/**
 * 자연어 입력으로 활동을 빠르게 기록하는 컴포넌트.
 *
 * Optimistic UI 전략:
 * 1. "기록" 클릭 → 규칙 기반 파서로 즉시 ParseConfirmSheet 표시
 * 2. 백그라운드에서 /api/parse-activity 호출 → 응답 오면 더 정확한 결과로 교체
 */
export default function QuickInput() {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [parsedActivities, setParsedActivities] = useState<ParsedActivity[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // 1. 규칙 기반 즉시 파싱 → 즉시 확인 시트 표시
    const ruleResult = parseNaturalInput(trimmed);
    if (ruleResult.activities.length === 0) {
      // 폴백: 인식 안 되면 기타 카테고리 1건 생성
      ruleResult.activities.push({
        type: "activity",
        confidence: 0.3,
        data: { category: "기타", durationMin: 0, detail: trimmed },
      });
    }
    setParsedActivities(ruleResult.activities);
    setShowConfirm(true);

    // 2. 백그라운드 AI 보강 (실패해도 규칙 기반 결과 유지)
    setAiLoading(true);
    try {
      const aiResult = await callApi("/api/parse-activity", {
        method: "POST",
        body: JSON.stringify({ text: trimmed }),
      });
      if (Array.isArray(aiResult?.activities) && aiResult.activities.length > 0) {
        setParsedActivities(aiResult.activities);
      }
    } catch {
      // 네트워크 오류 등 — 규칙 기반 결과 유지
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClose = () => {
    setShowConfirm(false);
    setText("");
    setFocused(false);
    setParsedActivities([]);
  };

  const charCount = text.length;
  const isOverLimit = charCount > 450;

  return (
    <>
      <div
        className={`bg-white rounded-2xl border transition-all duration-200 ${
          focused
            ? "border-primary shadow-stitch-card-hover"
            : "border-slate-100 shadow-stitch-card"
        }`}
      >
        {/* 입력 영역 */}
        <div className="p-3.5">
          <div className="flex items-start gap-2.5">
            {/* 아이콘 */}
            <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MaterialIcon
                name={aiLoading ? "auto_awesome" : "edit_note"}
                size={18}
                className={`${aiLoading ? "text-primary animate-pulse" : "text-primary"}`}
              />
            </div>

            {/* textarea */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 500))}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(text.length > 0)}
                onKeyDown={handleKeyDown}
                placeholder="오늘 뭐 했어요? 자유롭게 입력하세요"
                rows={focused || text.length > 0 ? 2 : 1}
                className="w-full text-sm text-slate-700 placeholder:text-slate-400 resize-none
                           bg-transparent focus:outline-none leading-relaxed"
                aria-label="활동 자연어 입력"
              />

              {(focused || text.length > 0) && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  예: &quot;퍼즐 30분 하고 구름빵 읽었어&quot;
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 푸터: 글자수 + 기록 버튼 */}
        {(focused || text.length > 0) && (
          <div className="flex items-center justify-between px-3.5 pb-3 pt-0 border-t border-slate-50">
            <span className={`text-[11px] font-medium ${isOverLimit ? "text-rose-500" : "text-slate-400"}`}>
              {charCount}/500
            </span>
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold
                          transition-all duration-150 ${
                text.trim()
                  ? "bg-primary text-white shadow-stitch-btn hover:opacity-90 active:scale-95"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
              type="button"
              aria-label="기록하기"
            >
              <MaterialIcon name="send" size={14} />
              기록
            </button>
          </div>
        )}
      </div>

      {/* 확인 바텀시트 */}
      {showConfirm && parsedActivities.length > 0 && (
        <ParseConfirmSheet
          activities={parsedActivities}
          onClose={handleClose}
        />
      )}
    </>
  );
}
