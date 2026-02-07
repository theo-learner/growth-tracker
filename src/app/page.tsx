"use client";

import { useStore } from "@/store/useStore";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import MainApp from "@/components/MainApp";

/**
 * 메인 엔트리: 온보딩 미완료 시 온보딩, 완료 시 메인 앱
 */
export default function Home() {
  const onboardingComplete = useStore((s) => s.onboardingComplete);

  if (!onboardingComplete) {
    return <OnboardingFlow />;
  }

  return <MainApp />;
}
