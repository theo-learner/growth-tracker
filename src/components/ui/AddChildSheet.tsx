"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { ChildProfile } from "@/types";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface AddChildSheetProps {
  onClose: () => void;
}

/**
 * 아이 추가 바텀시트 — 두 번째 자녀 등록용 미니 폼
 */
export default function AddChildSheet({ onClose }: AddChildSheetProps) {
  const { addChild } = useStore();
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState<4 | 5 | 6 | null>(null);
  const [gender, setGender] = useState<"male" | "female" | "unknown" | null>(null);

  const canSave = nickname.trim() && age && gender;

  const handleSave = () => {
    if (!canSave) return;
    const child: ChildProfile = {
      id: `child-${Date.now()}`,
      nickname: nickname.trim(),
      age: age!,
      birthDate: birthDate || undefined,
      gender: gender!,
      createdAt: new Date().toISOString(),
    };
    addChild(child, true);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[24px] overflow-y-auto max-h-[90dvh]"
        style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.12)" }}
      >
        <div className="bottom-sheet-handle" />
        <div className="px-5 pb-10">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MaterialIcon name="child_care" size={20} className="text-primary" />
              <h3 className="text-lg font-bold">아이 추가</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <MaterialIcon name="close" size={18} />
            </button>
          </div>

          {/* 이름 */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-dark-gray mb-2">
              아이 이름 (닉네임)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 시안"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-surface-300
                         text-dark-gray placeholder:text-mid-gray/50
                         focus:border-primary focus:outline-none transition-colors"
              maxLength={10}
            />
          </div>

          {/* 생년월일 (선택) */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-dark-gray mb-2">
              생년월일{" "}
              <span className="text-xs font-normal text-mid-gray">(선택)</span>
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-surface-300
                         text-dark-gray focus:border-primary focus:outline-none transition-colors"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* 만 나이 */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-dark-gray mb-3">만 나이</label>
            <div className="flex gap-2">
              {([4, 5, 6] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAge(a)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors
                    ${age === a
                      ? "border-primary bg-primary-50/60 text-primary-700"
                      : "border-surface-200 bg-white text-dark-gray hover:border-primary/40"
                    }`}
                >
                  만 {a}세
                </button>
              ))}
            </div>
          </div>

          {/* 성별 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-dark-gray mb-3">성별</label>
            <div className="flex gap-2">
              {[
                { value: "female" as const, emoji: "👧", label: "여아" },
                { value: "male" as const, emoji: "👦", label: "남아" },
                { value: "unknown" as const, emoji: "🌈", label: "안 밝힘" },
              ].map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGender(g.value)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors
                    ${gender === g.value
                      ? "border-primary bg-primary-50/60 text-primary-700"
                      : "border-surface-200 bg-white text-dark-gray hover:border-primary/40"
                    }`}
                >
                  <div className="text-base mb-0.5">{g.emoji}</div>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="btn-primary"
          >
            추가하기
          </button>
        </div>
      </div>
    </>
  );
}
