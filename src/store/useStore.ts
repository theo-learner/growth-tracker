/**
 * Zustand 전역 스토어 — localStorage 기반 데모 모드
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ChildProfile,
  TemperamentAnswers,
  ActivityRecord,
  WeeklyReport,
  RecommendedActivity,
  RecommendedProduct,
  MonthlyDataPoint,
  Milestone,
} from "@/types";
import {
  generateSampleActivities,
  generateSampleWeeklyReport,
  generateSampleRecommendations,
  generateSampleProducts,
  generateSampleMonthlyData,
  generateSampleMilestones,
} from "@/lib/sample-data";

interface AppState {
  // 온보딩 상태
  onboardingComplete: boolean;
  onboardingStep: number;

  // 아이 프로필
  child: ChildProfile | null;
  temperament: TemperamentAnswers | null;
  hasExistingTest: boolean;

  // 활동 기록
  activities: ActivityRecord[];

  // 리포트 & 추천
  weeklyReport: WeeklyReport | null;
  recommendations: RecommendedActivity[];
  products: RecommendedProduct[];
  monthlyData: MonthlyDataPoint[];
  milestones: Milestone[];

  // 액션
  setOnboardingStep: (step: number) => void;
  setChild: (child: ChildProfile) => void;
  setTemperament: (answers: TemperamentAnswers) => void;
  setHasExistingTest: (has: boolean) => void;
  completeOnboarding: () => void;
  addActivity: (activity: ActivityRecord) => void;
  resetAll: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      onboardingComplete: false,
      onboardingStep: 1,
      child: null,
      temperament: null,
      hasExistingTest: false,
      activities: [],
      weeklyReport: null,
      recommendations: [],
      products: [],
      monthlyData: [],
      milestones: [],

      // 온보딩
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setChild: (child) => set({ child }),
      setTemperament: (answers) => set({ temperament: answers }),
      setHasExistingTest: (has) => set({ hasExistingTest: has }),

      // 온보딩 완료 → 샘플 데이터 자동 생성
      completeOnboarding: () => {
        const child = get().child;
        const name = child?.nickname || "아이";
        set({
          onboardingComplete: true,
          activities: generateSampleActivities(name),
          weeklyReport: generateSampleWeeklyReport(name),
          recommendations: generateSampleRecommendations(name),
          products: generateSampleProducts(),
          monthlyData: generateSampleMonthlyData(),
          milestones: generateSampleMilestones(),
        });
      },

      // 활동 기록 추가
      addActivity: (activity) =>
        set((state) => ({
          activities: [activity, ...state.activities],
        })),

      // 전체 초기화
      resetAll: () =>
        set({
          onboardingComplete: false,
          onboardingStep: 1,
          child: null,
          temperament: null,
          hasExistingTest: false,
          activities: [],
          weeklyReport: null,
          recommendations: [],
          products: [],
          monthlyData: [],
          milestones: [],
        }),
    }),
    {
      name: "growth-tracker-storage",
    }
  )
);
