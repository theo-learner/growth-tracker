"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { ChildProfile } from "@/types";

/**
 * Step 1: 아이 기본 정보 입력 v2
 * 따뜻한 일러스트 + 부드러운 인터랙션
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
    <div className="animate-fadeIn">
      {/* 아이 아바타 일러스트 — 따뜻한 원형 배경 */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          {/* 배경 원 — 소프트 그린 그라데이션 */}
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center
                          bg-gradient-to-br from-primary-50 to-primary-100
                          border-2 border-primary-200/50">
            <span className="text-5xl">🧒</span>
          </div>
          {/* 장식 잎사귀 */}
          <span className="absolute -top-1 -right-1 text-lg animate-bounce-gentle">🌱</span>
        </div>
        <h1 className="text-2xl font-bold text-dark-gray mt-5">
          우리 아이를 알려주세요
        </h1>
        <p className="text-sm text-mid-gray mt-2 leading-relaxed">
          간단한 정보만 입력하면 돼요.<br/>
          모든 정보는 안전하게 보관됩니다 🔒
        </p>
      </div>

      {/* 아이 이름/닉네임 */}
      <div className="mb-6">
        <label htmlFor="child-nickname" className="block text-sm font-semibold text-dark-gray mb-2">
          아이 이름 (닉네임)
        </label>
        <input
          id="child-nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="예: 유나"
          className="input-field"
          maxLength={10}
          aria-label="아이 이름 또는 닉네임 입력"
          required
        />
        {nickname.trim() && (
          <p className="text-xs text-primary mt-1.5 animate-fade-in">
            ✓ {nickname.trim()}(이)의 성장 이야기가 시작돼요!
          </p>
        )}
      </div>

      {/* 생년월일 입력 */}
      <div className="mb-6">
        <label htmlFor="birthDate" className="block text-sm font-semibold text-dark-gray mb-2">
          생년월일 <span className="text-xs font-normal text-dark-gray/60">(선택, K-DST 월령 계산용)</span>
        </label>
        <input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="input-field"
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* 나이 선택 — 카드형 */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-dark-gray mb-2">
          만 나이
        </label>
        <div className="flex gap-3">
          {([4, 5, 6] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAge(a)}
              className={`
                flex-1 py-3 rounded-card font-semibold text-base
                transition-all duration-200
                ${age === a
                  ? "bg-primary text-white shadow-stitch-btn scale-[1.02]"
                  : "bg-white text-dark-gray border border-light-gray hover:border-primary/40 hover:shadow-stitch-card"
                }
              `}
            >
              만 {a}세
            </button>
          ))}
        </div>
      </div>

      {/* 성별 선택 — 아이콘 카드 */}
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
              className={`
                flex-1 py-3.5 rounded-card font-medium
                transition-all duration-200
                flex flex-col items-center gap-1.5
                ${gender === g.value
                  ? "bg-primary text-white shadow-stitch-btn scale-[1.02]"
                  : "bg-white text-dark-gray border border-light-gray hover:border-primary/40 hover:shadow-stitch-card"
                }
              `}
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
        className="btn-primary"
      >
        다음으로 →
      </button>
    </div>
  );
}
