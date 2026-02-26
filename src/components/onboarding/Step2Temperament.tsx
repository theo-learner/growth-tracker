"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";

/**
 * Step 2: 기질 질문 3개 v2
 * 전문 용어 ❌, 엄마 언어 — 부드러운 카드 선택 UI
 */

const Q1_OPTIONS = [
  { value: "bold", emoji: "🙋", label: "낯선 곳도 씩씩하게!", desc: "새로운 친구도 먼저 다가가요" },
  { value: "adaptive", emoji: "🫣", label: "처음엔 좀 살피다가...", desc: "적응하면 잘 놀아요" },
  { value: "inhibited", emoji: "🤗", label: "엄마 뒤에 숨어요", desc: "익숙해지면 괜찮아요" },
] as const;

const Q2_OPTIONS = [
  { value: "verbal", emoji: "🗣️", label: "말 표현력" },
  { value: "hands", emoji: "✋", label: "손 조작" },
  { value: "puzzle", emoji: "🧩", label: "퍼즐·논리" },
  { value: "physical", emoji: "🏃", label: "체력" },
  { value: "art", emoji: "🎨", label: "미술·창의력" },
  { value: "numbers", emoji: "📐", label: "숫자·계산" },
] as const;

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
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center
                        bg-gradient-to-br from-sunny-yellow-light to-sunny-yellow/30 mb-4">
          <span className="text-3xl">😊</span>
        </div>
        <h1 className="text-2xl font-bold text-dark-gray">
          {childName}는 어떤 아이인가요?
        </h1>
        <p className="text-sm text-mid-gray mt-2">편하게 골라주세요, 정답은 없어요</p>
      </div>

      {/* Q1: 단일 선택 — 카드형 */}
      <div className="mb-8">
        <h2 className="section-title">
          🌍 새로운 환경에서 우리 아이는?
        </h2>
        <div className="flex flex-col gap-2.5">
          {Q1_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setQ1(opt.value)}
              className={`
                w-full py-4 px-4 rounded-card text-left
                transition-all duration-200
                ${q1 === opt.value
                  ? "bg-primary-50 border-2 border-primary shadow-stitch-btn/20 scale-[1.01]"
                  : "bg-white border border-light-gray hover:border-primary/40 hover:shadow-stitch-card"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                <div>
                  <span className={`font-semibold text-sm ${q1 === opt.value ? "text-primary-700" : "text-dark-gray"}`}>
                    {opt.label}
                  </span>
                  <p className="text-xs text-mid-gray mt-0.5">{opt.desc}</p>
                </div>
                {/* 선택 체크 */}
                {q1 === opt.value && (
                  <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 animate-scale-in">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Q2: 다중 선택 — 칩 그리드 */}
      <div className="mb-8">
        <h2 className="section-title">
          ⚡ 또래보다 빠르다고 느끼는 건?
        </h2>
        <p className="text-xs text-mid-gray mb-3 -mt-2">여러 개 선택 가능 · 없으면 건너뛰어도 돼요</p>
        <div className="grid grid-cols-3 gap-2.5">
          {Q2_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleMulti(q2, opt.value, setQ2)}
              className={`
                py-3.5 px-2 rounded-card text-center
                transition-all duration-200
                ${q2.includes(opt.value)
                  ? "bg-primary text-white shadow-stitch-btn scale-[1.03]"
                  : "bg-white text-dark-gray border border-light-gray hover:border-primary/40 hover:shadow-stitch-card"
                }
              `}
            >
              <div className="text-xl mb-1">{opt.emoji}</div>
              <div className="text-xs font-medium">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Q3: 다중 선택 */}
      <div className="mb-8">
        <h2 className="section-title">
          🎯 요즘 빠져있는 건?
        </h2>
        <p className="text-xs text-mid-gray mb-3 -mt-2">여러 개 선택 가능</p>
        <div className="grid grid-cols-3 gap-2.5">
          {Q3_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleMulti(q3, opt.value, setQ3)}
              className={`
                py-3.5 px-2 rounded-card text-center
                transition-all duration-200
                ${q3.includes(opt.value)
                  ? "bg-primary text-white shadow-stitch-btn scale-[1.03]"
                  : "bg-white text-dark-gray border border-light-gray hover:border-primary/40 hover:shadow-stitch-card"
                }
              `}
            >
              <div className="text-xl mb-1">{opt.emoji}</div>
              <div className="text-xs font-medium">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="flex gap-3">
        <button
          onClick={() => setOnboardingStep(1)}
          className="btn-secondary flex-1"
        >
          ← 이전
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="btn-primary flex-[2]"
        >
          다음으로 →
        </button>
      </div>
    </div>
  );
}
