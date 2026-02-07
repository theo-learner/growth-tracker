"use client";

import { useStore } from "@/store/useStore";
import Step1ChildInfo from "./Step1ChildInfo";
import Step2Temperament from "./Step2Temperament";
import Step3TestUpload from "./Step3TestUpload";

/**
 * 온보딩 3단계 플로우 컨트롤러
 */
export default function OnboardingFlow() {
  const step = useStore((s) => s.onboardingStep);

  return (
    <div className="min-h-screen bg-warm-beige px-5 pt-12 pb-8">
      {/* 상단 프로그레스 인디케이터 */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              s === step ? "bg-soft-green" : s < step ? "bg-soft-green/50" : "bg-light-gray"
            }`}
          />
        ))}
        <span className="text-xs text-mid-gray ml-2">{step}/3</span>
      </div>

      {step === 1 && <Step1ChildInfo />}
      {step === 2 && <Step2Temperament />}
      {step === 3 && <Step3TestUpload />}
    </div>
  );
}
