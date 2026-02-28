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
  PerChildData,
} from "@/types";
import {
  generateSampleActivities,
  generateSampleWeeklyReport,
  generateSampleRecommendations,
  generateSampleProducts,
  generateSampleMilestones,
} from "@/lib/sample-data";
import { computeMonthlyData } from "@/lib/score-engine";

interface AppState {
  // 온보딩 상태
  onboardingComplete: boolean;
  onboardingStep: number;

  // 다자녀 지원
  children: ChildProfile[];
  activeChildId: string | null;

  // 현재 선택된 아이 프로필 (computed)
  child: ChildProfile | null;
  temperament: TemperamentAnswers | null;
  hasExistingTest: boolean;

  // 활동 기록 (activeChildId 기준)
  activities: ActivityRecord[];
  allActivities: Record<string, ActivityRecord[]>; // childId -> activities

  // 자녀별 리포트·추천 묶음 (childId -> PerChildData)
  allChildData: Record<string, PerChildData>;

  // 현재 활성 아이 단축 참조 (기존 컴포넌트 호환)
  weeklyReport: WeeklyReport | null;
  recommendations: RecommendedActivity[];
  products: RecommendedProduct[];
  monthlyData: MonthlyDataPoint[];
  milestones: Milestone[];

  // K-DST 체크리스트 (키: "childId_range_taskIndex")
  kdstChecks: Record<string, boolean>;

  // 액션
  setOnboardingStep: (step: number) => void;
  setChild: (child: ChildProfile) => void;
  setTemperament: (answers: TemperamentAnswers) => void;
  setHasExistingTest: (has: boolean) => void;
  completeOnboarding: () => void;
  addActivity: (activity: ActivityRecord) => void;
  updateActivity: (id: string, updates: Partial<ActivityRecord>) => void;
  deleteActivity: (id: string) => void;

  // 다자녀 관리
  addChild: (child: ChildProfile, withSampleData?: boolean) => void;
  switchChild: (childId: string) => void;
  removeChild: (childId: string) => void;

  toggleKDSTCheck: (key: string) => void;
  recalculateMonthlyData: () => void;
  resetAll: () => void;
}

/** 현재 활성 아이 데이터를 allChildData에 저장 */
function snapshotCurrentChild(
  state: AppState
): Record<string, PerChildData> {
  if (!state.activeChildId) return state.allChildData;
  return {
    ...state.allChildData,
    [state.activeChildId]: {
      weeklyReport: state.weeklyReport,
      monthlyData: state.monthlyData,
      recommendations: state.recommendations,
      products: state.products,
      milestones: state.milestones,
    },
  };
}

const EMPTY_CHILD_DATA: PerChildData = {
  weeklyReport: null,
  monthlyData: [],
  recommendations: [],
  products: [],
  milestones: [],
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      onboardingComplete: false,
      onboardingStep: 1,

      // 다자녀 지원
      children: [],
      activeChildId: null,
      allActivities: {},
      allChildData: {},

      // 현재 선택된 아이 (직접 관리)
      child: null,
      temperament: null,
      hasExistingTest: false,
      activities: [],

      weeklyReport: null,
      recommendations: [],
      products: [],
      monthlyData: [],
      milestones: [],
      kdstChecks: {},

      // 온보딩
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setChild: (child) => set({ child }),
      setTemperament: (answers) => set({ temperament: answers }),
      setHasExistingTest: (has) => set({ hasExistingTest: has }),

      // 온보딩 완료 → 샘플 데이터 자동 생성
      completeOnboarding: () => {
        const state = get();
        const child = state.child;
        const name = child?.nickname || "아이";
        const sampleActivities = generateSampleActivities(name);
        const weeklyReport = generateSampleWeeklyReport(name);
        const recommendations = generateSampleRecommendations(name);
        const products = generateSampleProducts();
        const monthlyData = child
          ? computeMonthlyData(sampleActivities, child)
          : [];
        const milestones = generateSampleMilestones();

        // 다자녀 지원: children 배열에 추가
        const newChildren =
          child && !state.children.find((c) => c.id === child.id)
            ? [...state.children, child]
            : state.children;

        const newAllActivities = { ...state.allActivities };
        if (child) {
          newAllActivities[child.id] = sampleActivities;
        }

        const newAllChildData = { ...state.allChildData };
        if (child) {
          newAllChildData[child.id] = {
            weeklyReport,
            monthlyData,
            recommendations,
            products,
            milestones,
          };
        }

        set({
          onboardingComplete: true,
          children: newChildren,
          activeChildId: child?.id || null,
          activities: sampleActivities,
          allActivities: newAllActivities,
          allChildData: newAllChildData,
          weeklyReport,
          recommendations,
          products,
          monthlyData,
          milestones,
        });
      },

      // 활동 기록 추가 → 월간 점수 즉시 재계산
      addActivity: (activity) =>
        set((state) => {
          const newActivities = [activity, ...state.activities];
          const newAllActivities = { ...state.allActivities };
          if (state.activeChildId) {
            newAllActivities[state.activeChildId] = newActivities;
          }
          const monthlyData = state.child
            ? computeMonthlyData(newActivities, state.child)
            : state.monthlyData;

          const newAllChildData = state.activeChildId
            ? {
                ...state.allChildData,
                [state.activeChildId]: {
                  ...(state.allChildData[state.activeChildId] ?? EMPTY_CHILD_DATA),
                  monthlyData,
                },
              }
            : state.allChildData;

          return {
            activities: newActivities,
            allActivities: newAllActivities,
            monthlyData,
            allChildData: newAllChildData,
          };
        }),

      // 활동 기록 수정
      updateActivity: (id, updates) =>
        set((state) => {
          const newActivities = state.activities.map((act) =>
            act.id === id ? { ...act, ...updates } : act
          );
          const newAllActivities = { ...state.allActivities };
          if (state.activeChildId) {
            newAllActivities[state.activeChildId] = newActivities;
          }
          return { activities: newActivities, allActivities: newAllActivities };
        }),

      // 활동 기록 삭제 → 월간 점수 즉시 재계산
      deleteActivity: (id) =>
        set((state) => {
          const newActivities = state.activities.filter((act) => act.id !== id);
          const newAllActivities = { ...state.allActivities };
          if (state.activeChildId) {
            newAllActivities[state.activeChildId] = newActivities;
          }
          const monthlyData = state.child
            ? computeMonthlyData(newActivities, state.child)
            : state.monthlyData;

          const newAllChildData = state.activeChildId
            ? {
                ...state.allChildData,
                [state.activeChildId]: {
                  ...(state.allChildData[state.activeChildId] ?? EMPTY_CHILD_DATA),
                  monthlyData,
                },
              }
            : state.allChildData;

          return {
            activities: newActivities,
            allActivities: newAllActivities,
            monthlyData,
            allChildData: newAllChildData,
          };
        }),

      // 다자녀 관리: 아이 추가
      addChild: (child, withSampleData = false) =>
        set((state) => {
          // 현재 아이 데이터 스냅샷
          const newAllChildData = snapshotCurrentChild(state);
          const newAllActivities = { ...state.allActivities };
          if (state.activeChildId) {
            newAllActivities[state.activeChildId] = state.activities;
          }

          const sampleActivities = withSampleData
            ? generateSampleActivities(child.nickname)
            : [];
          const weeklyReport = withSampleData
            ? generateSampleWeeklyReport(child.nickname)
            : null;
          const recommendations = withSampleData
            ? generateSampleRecommendations(child.nickname)
            : [];
          const products = withSampleData ? generateSampleProducts() : [];
          const monthlyData =
            withSampleData && child
              ? computeMonthlyData(sampleActivities, child)
              : [];
          const milestones = withSampleData
            ? generateSampleMilestones()
            : [];

          newAllActivities[child.id] = sampleActivities;
          newAllChildData[child.id] = {
            weeklyReport,
            monthlyData,
            recommendations,
            products,
            milestones,
          };

          return {
            children: [...state.children, child],
            activeChildId: child.id,
            child,
            activities: sampleActivities,
            allActivities: newAllActivities,
            allChildData: newAllChildData,
            weeklyReport,
            recommendations,
            products,
            monthlyData,
            milestones,
          };
        }),

      // 다자녀 관리: 아이 전환
      switchChild: (childId) =>
        set((state) => {
          const targetChild = state.children.find((c) => c.id === childId);
          if (!targetChild) return state;

          // 현재 아이의 모든 데이터 저장
          const updatedAllActivities = { ...state.allActivities };
          if (state.activeChildId) {
            updatedAllActivities[state.activeChildId] = state.activities;
          }
          const updatedAllChildData = snapshotCurrentChild(state);

          // 대상 아이 데이터 복원
          const targetData =
            updatedAllChildData[childId] ?? EMPTY_CHILD_DATA;

          return {
            activeChildId: childId,
            child: targetChild,
            activities: updatedAllActivities[childId] || [],
            allActivities: updatedAllActivities,
            allChildData: updatedAllChildData,
            weeklyReport: targetData.weeklyReport,
            monthlyData: targetData.monthlyData,
            recommendations: targetData.recommendations,
            products: targetData.products,
            milestones: targetData.milestones,
          };
        }),

      // 다자녀 관리: 아이 삭제
      removeChild: (childId) =>
        set((state) => {
          const newChildren = state.children.filter((c) => c.id !== childId);
          const newAllActivities = { ...state.allActivities };
          delete newAllActivities[childId];
          const newAllChildData = { ...state.allChildData };
          delete newAllChildData[childId];

          // 삭제된 아이가 현재 선택된 아이면 다른 아이로 전환
          let newActiveChildId = state.activeChildId;
          let newChild = state.child;
          let newActivities = state.activities;
          let newWeeklyReport = state.weeklyReport;
          let newMonthlyData = state.monthlyData;
          let newRecommendations = state.recommendations;
          let newProducts = state.products;
          let newMilestones = state.milestones;

          if (state.activeChildId === childId) {
            newActiveChildId =
              newChildren.length > 0 ? newChildren[0].id : null;
            newChild = newChildren.length > 0 ? newChildren[0] : null;
            newActivities = newActiveChildId
              ? newAllActivities[newActiveChildId] || []
              : [];
            const fallback = newActiveChildId
              ? newAllChildData[newActiveChildId] ?? EMPTY_CHILD_DATA
              : EMPTY_CHILD_DATA;
            newWeeklyReport = fallback.weeklyReport;
            newMonthlyData = fallback.monthlyData;
            newRecommendations = fallback.recommendations;
            newProducts = fallback.products;
            newMilestones = fallback.milestones;
          }

          return {
            children: newChildren,
            activeChildId: newActiveChildId,
            child: newChild,
            activities: newActivities,
            allActivities: newAllActivities,
            allChildData: newAllChildData,
            weeklyReport: newWeeklyReport,
            monthlyData: newMonthlyData,
            recommendations: newRecommendations,
            products: newProducts,
            milestones: newMilestones,
            onboardingComplete: newChildren.length > 0,
          };
        }),

      // K-DST 체크 토글
      toggleKDSTCheck: (key) =>
        set((state) => ({
          kdstChecks: { ...state.kdstChecks, [key]: !state.kdstChecks[key] },
        })),

      // 월간 점수 수동 재계산
      recalculateMonthlyData: () =>
        set((state) => {
          if (!state.child) return state;
          const monthlyData = computeMonthlyData(state.activities, state.child);
          const newAllChildData = state.activeChildId
            ? {
                ...state.allChildData,
                [state.activeChildId]: {
                  ...(state.allChildData[state.activeChildId] ?? EMPTY_CHILD_DATA),
                  monthlyData,
                },
              }
            : state.allChildData;
          return { monthlyData, allChildData: newAllChildData };
        }),

      // 전체 초기화
      resetAll: () =>
        set({
          onboardingComplete: false,
          onboardingStep: 1,
          children: [],
          activeChildId: null,
          allActivities: {},
          allChildData: {},
          child: null,
          temperament: null,
          hasExistingTest: false,
          activities: [],
          weeklyReport: null,
          recommendations: [],
          products: [],
          monthlyData: [],
          milestones: [],
          kdstChecks: {},
        }),
    }),
    {
      name: "growth-tracker-storage",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        try {
          const state = persistedState as Record<string, unknown>;
          if (version < 2) {
            // v0/v1 → v2: 전역 단일값을 childId 기준 Record로 마이그레이션
            const activeChildId = state.activeChildId as string | null;
            if (activeChildId && !state.allChildData) {
              state.allChildData = {
                [activeChildId]: {
                  weeklyReport: state.weeklyReport ?? null,
                  monthlyData: state.monthlyData ?? [],
                  recommendations: state.recommendations ?? [],
                  products: state.products ?? [],
                  milestones: state.milestones ?? [],
                },
              };
            } else if (!state.allChildData) {
              state.allChildData = {};
            }
          }
          return state as unknown as AppState;
        } catch {
          // 마이그레이션 실패 시 원본 그대로 반환
          return persistedState as unknown as AppState;
        }
      },
    }
  )
);
