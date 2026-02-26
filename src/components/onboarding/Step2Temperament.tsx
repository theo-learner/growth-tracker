"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";

/**
 * Step 2: 기질 질문 3개 — Stitch K-DST 라디오 카드 스타일
 */

const Q1_OPTIONS = [
  { value: "bold",     emoji: "🙋", label: "낯선 곳도 씩씩하게!", desc: "새로운 친구도 먼저 다가가요" },
  { value: "adaptive", emoji: "🫣", label: "처음엔 좀 살피다가...", desc: "적응하면 잘 놀아요" },
  { value: "inhibited",emoji: "🤗", label: "엄마 뒤에 숨어요",     desc: "익숙해지면 괜찮아요" },
] as const;

const Q2_OPTIONS = [
  { value: "verbal",   emoji: "🗣️", label: "말 표현력" },
  { value: "hands",    emoji: "✋", label: "손 조작" },
  { value: "puzzle",   emoji: "🧩", label: "퍼즐·논리" },
  { value: "physical", emoji: "🏃", label: "체력" },
  { value: "art",      emoji: "🎨", label: "미술·창의력" },
  { value: "numbers",  emoji: "📐", label: "숫자·계산" },
] as const;

const Q3_OPTIONS = [
  { value: "puzzle",  emoji: "🧩", label: "퍼즐" },
  { value: "books",   emoji: "📚", label: "책" },
  { value: "drawing", emoji: "🎨", label: "그림" },
  { value: "blocks",  emoji: "🏗️", label: "블록" },
  { value: "music",   emoji: "🎹", label: "음악" },
  { value: "sports",  emoji: "🏃", label: "운동" },
] as const;

export default function Step2Temperament() {
  const { child, setTemperament, setOnboardingStep } = useStore();
  const childName = child?.nickname || "아이";

  const [q1, setQ1] = useState<string>("");
  const [q2, setQ2] = useState<string[]>([]);
  const [q3, setQ3] = useState<string[]>([]);

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleNext = () => {
    if (!q1) return;
    setTemperament({
      newEnvironment: q1 as "bold" | "adaptive" | "inhibited",
      fasterThanPeers: q2,
      currentObsession: q3,
    });
    setOnboardingStep(3);
  };

  return (
    <div className="animate-fadeIn space-y-8">
      {/* 섹션 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-dark-gray tracking-tight">
          {childName}는 어떤 아이인가요?
        </h2>
        <p className="text-sm text-mid-gray mt-1.5">편하게 골라주세요, 정답은 없어요</p>
      </div>

      {/* Q1: 새로운 환경 — 라디오 카드 (K-DST 스타일) */}
      <div>
        <div className="bg-white rounded-xl border border-primary-100/40 p-5 shadow-stitch-card">
          {/* 질문 번호 + 텍스트 */}
          <div className="flex gap-3 mb-5">
            <span className="w-8 h-8 rounded-lg bg-primary text-white text-sm font-bold
                             flex items-center justify-center shrink-0">1</span>
            <p className="text-base font-semibold text-dark-gray leading-snug">
              🌍 새로운 환경에서 {childName}는?
            </p>
          </div>
          <div className="space-y-2.5">
            {Q1_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQ1(opt.value)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2
                            text-left transition-colors duration-200
                            ${q1 === opt.value
                              ? "border-primary bg-primary-50/60"
                              : "border-surface-200 hover:border-primary/40"
                            }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt.emoji}</span>
                  <div>
                    <span className={`block font-semibold text-sm ${q1 === opt.value ? "text-primary-700" : "text-dark-gray"}`}>
                      {opt.label}
                    </span>
                    <span className="block text-xs text-mid-gray mt-0.5">{opt.desc}</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  q1 === opt.value ? "border-primary" : "border-surface-400"
                }`}>
                  {q1 === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Q2: 또래보다 빠른 것 — 다중 선택 그리드 */}
      <div>
        <div className="bg-white rounded-xl border border-primary-100/40 p-5 shadow-stitch-card">
          <div className="flex gap-3 mb-1">
            <span className="w-8 h-8 rounded-lg bg-primary text-white text-sm font-bold
                             flex items-center justify-center shrink-0">2</span>
            <p className="text-base font-semibold text-dark-gray leading-snug">
              ⚡ 또래보다 빠르다고 느끼는 건?
            </p>
          </div>
          <p className="text-xs text-mid-gray mb-4 ml-11">여러 개 선택 가능 · 없으면 건너뛰어도 돼요</p>
          <div className="grid grid-cols-3 gap-2">
            {Q2_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggle(q2, opt.value, setQ2)}
                className={`py-3.5 px-2 rounded-xl text-center border-2
                            transition-all duration-200
                            ${q2.includes(opt.value)
                              ? "border-primary bg-primary text-white"
                              : "border-surface-200 bg-white text-dark-gray hover:border-primary/40"
                            }`}
              >
                <div className="text-xl mb-1">{opt.emoji}</div>
                <div className="text-xs font-medium">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Q3: 요즘 빠져있는 것 — 다중 선택 그리드 */}
      <div>
        <div className="bg-white rounded-xl border border-primary-100/40 p-5 shadow-stitch-card">
          <div className="flex gap-3 mb-1">
            <span className="w-8 h-8 rounded-lg bg-primary text-white text-sm font-bold
                             flex items-center justify-center shrink-0">3</span>
            <p className="text-base font-semibold text-dark-gray leading-snug">
              🎯 요즘 빠져있는 건?
            </p>
          </div>
          <p className="text-xs text-mid-gray mb-4 ml-11">여러 개 선택 가능</p>
          <div className="grid grid-cols-3 gap-2">
            {Q3_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggle(q3, opt.value, setQ3)}
                className={`py-3.5 px-2 rounded-xl text-center border-2
                            transition-all duration-200
                            ${q3.includes(opt.value)
                              ? "border-primary bg-primary text-white"
                              : "border-surface-200 bg-white text-dark-gray hover:border-primary/40"
                            }`}
              >
                <div className="text-xl mb-1">{opt.emoji}</div>
                <div className="text-xs font-medium">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={handleNext}
        disabled={!q1}
        className="btn-primary"
      >
        다음 단계 →
      </button>
    </div>
  );
}
