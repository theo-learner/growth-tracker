"use client";

import { useStore } from "@/store/useStore";
import Step1ChildInfo from "./Step1ChildInfo";
import Step2Temperament from "./Step2Temperament";
import Step3TestUpload from "./Step3TestUpload";

/**
 * 온보딩 3단계 플로우 컨트롤러 v3
 * 프리미엄 스텝 인디케이터 + 부드러운 전환
 */
export default function OnboardingFlow() {
  const step = useStore((s) => s.onboardingStep);

  const STEP_LABELS = ["기본 정보", "기질 파악", "검사 결과"];

  return (
    <div className="min-h-screen bg-warm-beige px-5 pt-10 pb-8">
      {/* ── 상단 프로그레스 인디케이터 ── */}
      <div className="mb-10 px-4">
        {/* 전체 진행률 바 */}
        <div className="onboarding-progress-track mb-6">
          <div
            className="onboarding-progress-fill"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>

        {/* 스텝 도트 + 라벨 + 연결선 */}
        <div className="flex items-start justify-between px-2">
          {[1, 2, 3].map((s, idx) => (
            <div key={s} className="flex items-center flex-1">
              {/* 도트 + 라벨 컬럼 */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    step-dot
                    ${s < step
                      ? "step-dot-done"
                      : s === step
                        ? "step-dot-active"
                        : "step-dot-pending"
                    }
                  `}
                >
                  {s < step ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3.5 8L6.5 11L12.5 4.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                <span className={`
                  step-label
                  ${s < step
                    ? "step-label-done"
                    : s === step
                      ? "step-label-active"
                      : "step-label-pending"
                  }
                `}>
                  {STEP_LABELS[idx]}
                </span>
              </div>

              {/* 연결선 */}
              {idx < 2 && (
                <div className="flex-1 mx-2 mt-[-18px]">
                  <div className="onboarding-progress-track">
                    <div
                      className="onboarding-progress-fill"
                      style={{
                        width: s < step ? "100%" : s === step ? "40%" : "0%",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && <Step1ChildInfo />}
      {step === 2 && <Step2Temperament />}
      {step === 3 && <Step3TestUpload />}
    </div>
  );
}
