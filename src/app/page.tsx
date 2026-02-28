"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { startReminderScheduler } from "@/lib/notifications";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import MainApp from "@/components/MainApp";

/**
 * 메인 엔트리: 온보딩 미완료 시 온보딩, 완료 시 메인 앱
 */
export default function Home() {
  const onboardingComplete = useStore((s) => s.onboardingComplete);

  // 온보딩 완료 후 리마인더 스케줄러 시작
  useEffect(() => {
    if (onboardingComplete) {
      startReminderScheduler();
    }
  }, [onboardingComplete]);

  if (!onboardingComplete) {
    return <OnboardingFlow />;
  }

  return <MainApp />;
}
