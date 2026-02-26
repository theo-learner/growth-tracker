"use client";

import { useStore } from "@/store/useStore";
import Step1ChildInfo from "./Step1ChildInfo";
import Step2Temperament from "./Step2Temperament";
import Step3TestUpload from "./Step3TestUpload";
import MaterialIcon from "@/components/ui/MaterialIcon";

const STEP_META = [
  { label: "기본 정보", desc: "아이를 소개해 주세요" },
  { label: "기질 파악", desc: "성향을 알려주세요" },
  { label: "검사 결과", desc: "AI 분석 정확도를 높여요" },
];

/**
 * 온보딩 플로우 — Stitch K-DST 디자인
 * 상단: 현재 단계명 + Step X of 3 + 진행 바
 */
export default function OnboardingFlow() {
  const { onboardingStep: step, setOnboardingStep } = useStore();
  const meta = STEP_META[step - 1];
  const pct = Math.round(((step - 1) / 3) * 100);

  return (
    <div className="min-h-screen bg-surface-100 flex flex-col">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-primary-100/60
                         flex items-center px-4 py-4">
        {step > 1 ? (
          <button
            onClick={() => setOnboardingStep(step - 1 as 1 | 2)}
            aria-label="이전 단계"
            className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0"
          >
            <MaterialIcon name="arrow_back" size={20} className="text-primary" />
          </button>
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <MaterialIcon name="child_care" size={20} className="text-primary" />
          </div>
        )}
        <div className="flex-1 text-center">
          <h1 className="text-base font-bold text-dark-gray">성장 트래커</h1>
          <span className="text-primary text-[11px] font-bold uppercase tracking-wider">
            처음 만남
          </span>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
          <MaterialIcon name="help_outline" size={20} className="text-mid-gray" />
        </div>
      </header>

      {/* 진행 섹션 — K-DST 스타일 */}
      <div className="bg-white px-6 py-5 border-b border-surface-200">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-primary text-[11px] font-bold uppercase tracking-widest mb-1">
              현재 단계
            </p>
            <p className="text-xl font-bold text-dark-gray">{meta.label}</p>
          </div>
          <p className="text-mid-gray text-sm font-medium">Step {step} of 3</p>
        </div>
        {/* 진행 바 */}
        <div className="relative h-2.5 w-full rounded-full bg-surface-200 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct + 10}%` }}
          />
        </div>
        <p className="text-primary/80 text-xs font-medium mt-2">{meta.desc}</p>
      </div>

      {/* 콘텐츠 */}
      <main className="flex-1 px-5 py-6">
        {step === 1 && <Step1ChildInfo />}
        {step === 2 && <Step2Temperament />}
        {step === 3 && <Step3TestUpload />}
      </main>
    </div>
  );
}
