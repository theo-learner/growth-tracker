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
  updateActivity: (id: string, updates: Partial<ActivityRecord>) => void;
  deleteActivity: (id: string) => void;
  
  // 다자녀 관리
  addChild: (child: ChildProfile) => void;
  switchChild: (childId: string) => void;
  removeChild: (childId: string) => void;
  
  resetAll: () => void;
}

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
        
        // 다자녀 지원: children 배열에 추가
        const newChildren = child && !state.children.find(c => c.id === child.id)
          ? [...state.children, child]
          : state.children;
        
        const newAllActivities = { ...state.allActivities };
        if (child) {
          newAllActivities[child.id] = sampleActivities;
        }
        
        set({
          onboardingComplete: true,
          children: newChildren,
          activeChildId: child?.id || null,
          activities: sampleActivities,
          allActivities: newAllActivities,
          weeklyReport: generateSampleWeeklyReport(name),
          recommendations: generateSampleRecommendations(name),
          products: generateSampleProducts(),
          monthlyData: generateSampleMonthlyData(),
          milestones: generateSampleMilestones(),
        });
      },

      // 활동 기록 추가
      addActivity: (activity) =>
        set((state) => {
          const newActivities = [activity, ...state.activities];
          const newAllActivities = { ...state.allActivities };
          if (state.activeChildId) {
            newAllActivities[state.activeChildId] = newActivities;
          }
          return { activities: newActivities, allActivities: newAllActivities };
        }),

      // 활동 기록 수정
      updateActivity: (id, updates) =>
        set((state) => ({
          activities: state.activities.map((act) =>
            act.id === id ? { ...act, ...updates } : act
          ),
        })),

      // 활동 기록 삭제
      deleteActivity: (id) =>
        set((state) => {
          const newActivities = state.activities.filter((act) => act.id !== id);
          const newAllActivities = { ...state.allActivities };
          if (state.activeChildId) {
            newAllActivities[state.activeChildId] = newActivities;
          }
          return { activities: newActivities, allActivities: newAllActivities };
        }),

      // 다자녀 관리: 아이 추가
      addChild: (child) =>
        set((state) => ({
          children: [...state.children, child],
          activeChildId: child.id,
          child: child,
          activities: [],
          allActivities: { ...state.allActivities, [child.id]: [] },
        })),

      // 다자녀 관리: 아이 전환
      switchChild: (childId) =>
        set((state) => {
          const targetChild = state.children.find((c) => c.id === childId);
          if (!targetChild) return state;
          
          // 현재 아이의 활동 저장
          const updatedAllActivities = { ...state.allActivities };
          if (state.activeChildId) {
            updatedAllActivities[state.activeChildId] = state.activities;
          }
          
          return {
            activeChildId: childId,
            child: targetChild,
            activities: updatedAllActivities[childId] || [],
            allActivities: updatedAllActivities,
          };
        }),

      // 다자녀 관리: 아이 삭제
      removeChild: (childId) =>
        set((state) => {
          const newChildren = state.children.filter((c) => c.id !== childId);
          const newAllActivities = { ...state.allActivities };
          delete newAllActivities[childId];
          
          // 삭제된 아이가 현재 선택된 아이면 다른 아이로 전환
          let newActiveChildId = state.activeChildId;
          let newChild = state.child;
          let newActivities = state.activities;
          
          if (state.activeChildId === childId) {
            newActiveChildId = newChildren.length > 0 ? newChildren[0].id : null;
            newChild = newChildren.length > 0 ? newChildren[0] : null;
            newActivities = newActiveChildId ? (newAllActivities[newActiveChildId] || []) : [];
          }
          
          return {
            children: newChildren,
            activeChildId: newActiveChildId,
            child: newChild,
            activities: newActivities,
            allActivities: newAllActivities,
            onboardingComplete: newChildren.length > 0,
          };
        }),

      // 전체 초기화
      resetAll: () =>
        set({
          onboardingComplete: false,
          onboardingStep: 1,
          children: [],
          activeChildId: null,
          allActivities: {},
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
