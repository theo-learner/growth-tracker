"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";

/**
 * Step 2: 기질 질문 3개 (전문 용어 ❌, 엄마 언어로)
 */

// Q1: 새로운 환경에서 우리 아이는? (단일 선택)
const Q1_OPTIONS = [
  { value: "bold", emoji: "🙋", label: "낯선 곳도 씩씩하게!" },
  { value: "adaptive", emoji: "🫣", label: "처음엔 좀 살피다가..." },
  { value: "inhibited", emoji: "🤗", label: "엄마 뒤에 숨어요" },
] as const;

// Q2: 또래보다 빠르다고 느끼는 건? (다중 선택)
const Q2_OPTIONS = [
  { value: "verbal", emoji: "🗣️", label: "말 표현력" },
  { value: "hands", emoji: "✋", label: "손 조작" },
  { value: "puzzle", emoji: "🧩", label: "퍼즐·논리" },
  { value: "physical", emoji: "🏃", label: "체력" },
  { value: "art", emoji: "🎨", label: "미술·창의력" },
  { value: "numbers", emoji: "📐", label: "숫자·계산" },
] as const;

// Q3: 요즘 빠져있는 건? (다중 선택)
const Q3_OPTIONS = [
  { value: "puzzle", emoji: "🧩", label: "퍼즐" },
  { value: "books", emoji: "📚", label: "책" },
  { value: "drawing", emoji: "🎨", label: "그림" },
  { value: "blocks", emoji: "🏗️", label: "블록" },
  { value: "music", emoji: "🎹", label: "음악" },
  { value: "sports", emoji: "🏃", label: "운동" },
] as const;

export default function Step2Temperament() {
  const { child, setTemperament, setOnboardingStep } = useStore();
  const childName = child?.nickname || "아이";

  const [q1, setQ1] = useState<string>("");
  const [q2, setQ2] = useState<string[]>([]);
  const [q3, setQ3] = useState<string[]>([]);

  const toggleMulti = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const canProceed = q1 !== "";

  const handleNext = () => {
    if (!canProceed) return;
    setTemperament({
      newEnvironment: q1 as "bold" | "adaptive" | "inhibited",
      fasterThanPeers: q2,
      currentObsession: q3,
    });
    setOnboardingStep(3);
  };

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          {childName}는 어떤 아이인가요? 😊
        </h1>
        <p className="text-sm text-mid-gray mt-2">편하게 골라주세요</p>
      </div>

      {/* Q1: 단일 선택 */}
      <div className="mb-8">
        <h2 className="text-base font-semibold mb-3">
          새로운 환경에서 우리 아이는?
        </h2>
        <div className="flex flex-col gap-2">
          {Q1_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setQ1(opt.value)}
              className={`w-full py-3 px-4 rounded-card text-left font-medium transition-all
                ${q1 === opt.value
                  ? "bg-soft-green/10 border-2 border-soft-green text-dark-gray"
                  : "bg-white border border-light-gray text-dark-gray hover:border-soft-green/50"
                }`}
            >
              <span className="mr-2">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Q2: 다중 선택 */}
      <div className="mb-8">
        <h2 className="text-base font-semibold mb-1">
          또래보다 빠르다고 느끼는 건?
        </h2>
        <p className="text-xs text-mid-gray mb-3">여러 개 선택 가능 · 없으면 건너뛰어도 돼요</p>
        <div className="grid grid-cols-3 gap-2">
          {Q2_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleMulti(q2, opt.value, setQ2)}
              className={`py-3 px-2 rounded-card text-center font-medium transition-all text-sm
                ${q2.includes(opt.value)
                  ? "bg-soft-green text-white shadow-md"
                  : "bg-white text-dark-gray border border-light-gray hover:border-soft-green"
                }`}
            >
              <div className="text-xl mb-1">{opt.emoji}</div>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Q3: 다중 선택 */}
      <div className="mb-8">
        <h2 className="text-base font-semibold mb-1">
          요즘 빠져있는 건?
        </h2>
        <p className="text-xs text-mid-gray mb-3">여러 개 선택 가능</p>
        <div className="grid grid-cols-3 gap-2">
          {Q3_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleMulti(q3, opt.value, setQ3)}
              className={`py-3 px-2 rounded-card text-center font-medium transition-all text-sm
                ${q3.includes(opt.value)
                  ? "bg-soft-green text-white shadow-md"
                  : "bg-white text-dark-gray border border-light-gray hover:border-soft-green"
                }`}
            >
              <div className="text-xl mb-1">{opt.emoji}</div>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="flex gap-3">
        <button
          onClick={() => setOnboardingStep(1)}
          className="flex-1 h-12 rounded-button font-semibold text-base
                     bg-white text-mid-gray border border-light-gray
                     hover:border-soft-green transition-all"
        >
          ← 이전
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`flex-[2] h-12 rounded-button font-semibold text-base transition-all
            ${canProceed
              ? "bg-soft-green text-white shadow-md hover:bg-soft-green/90 active:scale-[0.98]"
              : "bg-light-gray text-mid-gray cursor-not-allowed"
            }`}
        >
          다음으로 →
        </button>
      </div>
    </div>
  );
}
