"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { ChildProfile } from "@/types";

/**
 * Step 1: 아이 기본 정보 입력
 */
export default function Step1ChildInfo() {
  const { setChild, setOnboardingStep } = useStore();
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState<4 | 5 | 6 | null>(null);
  const [gender, setGender] = useState<"male" | "female" | "unknown" | null>(null);

  const canProceed = nickname.trim() && age && gender;

  const handleNext = () => {
    if (!canProceed) return;
    const child: ChildProfile = {
      id: `child-${Date.now()}`,
      nickname: nickname.trim(),
      age: age!,
      gender: gender!,
      createdAt: new Date().toISOString(),
    };
    setChild(child);
    setOnboardingStep(2);
  };

  return (
    <div className="animate-fadeIn">
      {/* 아이 아바타 일러스트 */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🧒</div>
        <h1 className="text-2xl font-bold text-dark-gray">
          우리 아이를 알려주세요 🌱
        </h1>
        <p className="text-sm text-mid-gray mt-2">간단한 정보만 입력하면 돼요</p>
      </div>

      {/* 아이 이름/닉네임 */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-dark-gray mb-2">
          아이 이름 (닉네임)
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="예: 유나"
          className="w-full h-12 px-4 rounded-button border border-light-gray bg-white
                     text-base text-dark-gray placeholder:text-mid-gray/50
                     focus:outline-none focus:border-soft-green focus:ring-2 focus:ring-soft-green/20
                     transition-all"
          maxLength={10}
        />
      </div>

      {/* 나이 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-dark-gray mb-2">
          만 나이
        </label>
        <div className="flex gap-3">
          {([4, 5, 6] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAge(a)}
              className={`flex-1 h-12 rounded-button font-semibold text-base transition-all
                ${age === a
                  ? "bg-soft-green text-white shadow-md"
                  : "bg-white text-dark-gray border border-light-gray hover:border-soft-green"
                }`}
            >
              만 {a}세
            </button>
          ))}
        </div>
      </div>

      {/* 성별 선택 */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-dark-gray mb-2">
          성별
        </label>
        <div className="flex gap-3">
          {[
            { value: "female" as const, emoji: "👧", label: "여아" },
            { value: "male" as const, emoji: "👦", label: "남아" },
            { value: "unknown" as const, emoji: "🌈", label: "안 밝힘" },
          ].map((g) => (
            <button
              key={g.value}
              onClick={() => setGender(g.value)}
              className={`flex-1 py-3 rounded-button font-medium transition-all flex flex-col items-center gap-1
                ${gender === g.value
                  ? "bg-soft-green text-white shadow-md"
                  : "bg-white text-dark-gray border border-light-gray hover:border-soft-green"
                }`}
            >
              <span className="text-2xl">{g.emoji}</span>
              <span className="text-sm">{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={handleNext}
        disabled={!canProceed}
        className={`w-full h-12 rounded-button font-semibold text-base transition-all
          ${canProceed
            ? "bg-soft-green text-white shadow-md hover:bg-soft-green/90 active:scale-[0.98]"
            : "bg-light-gray text-mid-gray cursor-not-allowed"
          }`}
      >
        다음으로 →
      </button>
    </div>
  );
}
