"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { ChildProfile } from "@/types";
import MaterialIcon from "@/components/ui/MaterialIcon";

/**
 * Step 1: 아이 기본 정보 — Stitch K-DST 카드 스타일
 */
export default function Step1ChildInfo() {
  const { setChild, setOnboardingStep } = useStore();
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState<4 | 5 | 6 | null>(null);
  const [gender, setGender] = useState<"male" | "female" | "unknown" | null>(null);

  const canProceed = nickname.trim() && age && gender;

  const handleNext = () => {
    if (!canProceed) return;
    const child: ChildProfile = {
      id: `child-${Date.now()}`,
      nickname: nickname.trim(),
      age: age!,
      birthDate: birthDate || undefined,
      gender: gender!,
      createdAt: new Date().toISOString(),
    };
    setChild(child);
    setOnboardingStep(2);
  };

  return (
    <div className="animate-fadeIn space-y-6">
      {/* 섹션 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-dark-gray tracking-tight">우리 아이를 알려주세요</h2>
        <p className="text-sm text-mid-gray mt-1.5 leading-relaxed">
          간단한 정보만 입력하면 돼요. 모든 정보는 기기에 안전하게 보관됩니다.
        </p>
      </div>

      {/* 아이 이름 */}
      <div>
        <label htmlFor="child-nickname" className="block text-sm font-semibold text-dark-gray mb-2">
          아이 이름 (닉네임)
        </label>
        <input
          id="child-nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="예: 유나"
          className="w-full px-4 py-3.5 rounded-xl border-2 border-surface-300
                     text-dark-gray placeholder:text-mid-gray/50
                     focus:border-primary focus:outline-none
                     transition-colors duration-200"
          maxLength={10}
          required
        />
        {nickname.trim() && (
          <p className="text-xs text-primary mt-1.5 flex items-center gap-1 animate-fade-in">
            <MaterialIcon name="check_circle" size={13} className="text-primary" filled />
            {nickname.trim()}(이)의 성장 이야기가 시작돼요!
          </p>
        )}
      </div>

      {/* 생년월일 */}
      <div>
        <label htmlFor="birthDate" className="block text-sm font-semibold text-dark-gray mb-2">
          생년월일{" "}
          <span className="text-xs font-normal text-mid-gray">(선택 · K-DST 월령 계산용)</span>
        </label>
        <input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border-2 border-surface-300
                     text-dark-gray focus:border-primary focus:outline-none
                     transition-colors duration-200"
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* 만 나이 — 라디오 카드 */}
      <div>
        <label className="block text-sm font-semibold text-dark-gray mb-3">만 나이</label>
        <div className="space-y-2.5">
          {([4, 5, 6] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAge(a)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2
                          text-left transition-colors duration-200
                          ${age === a
                            ? "border-primary bg-primary-50/60"
                            : "border-surface-200 bg-white hover:border-primary/40"
                          }`}
            >
              <span className={`font-semibold text-sm ${age === a ? "text-primary-700" : "text-dark-gray"}`}>
                만 {a}세
              </span>
              {/* K-DST 라디오 닷 */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                age === a
                  ? "border-primary"
                  : "border-surface-400"
              }`}>
                {age === a && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 성별 — 라디오 카드 */}
      <div>
        <label className="block text-sm font-semibold text-dark-gray mb-3">성별</label>
        <div className="space-y-2.5">
          {[
            { value: "female" as const, emoji: "👧", label: "여아" },
            { value: "male"   as const, emoji: "👦", label: "남아" },
            { value: "unknown" as const, emoji: "🌈", label: "밝히지 않음" },
          ].map((g) => (
            <button
              key={g.value}
              onClick={() => setGender(g.value)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2
                          text-left transition-colors duration-200
                          ${gender === g.value
                            ? "border-primary bg-primary-50/60"
                            : "border-surface-200 bg-white hover:border-primary/40"
                          }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{g.emoji}</span>
                <span className={`font-semibold text-sm ${gender === g.value ? "text-primary-700" : "text-dark-gray"}`}>
                  {g.label}
                </span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                gender === g.value ? "border-primary" : "border-surface-400"
              }`}>
                {gender === g.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={handleNext}
        disabled={!canProceed}
        className="btn-primary mt-2"
      >
        다음 단계 →
      </button>
    </div>
  );
}
