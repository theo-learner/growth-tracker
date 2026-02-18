import { describe, it, expect, beforeEach, vi } from "vitest";
import { useStore } from "@/store/useStore";

// Mock localStorage for zustand persist
const mockStorage: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
});

describe("useStore", () => {
  beforeEach(() => {
    useStore.getState().resetAll();
  });

  describe("initial state", () => {
    it("starts with onboarding incomplete", () => {
      expect(useStore.getState().onboardingComplete).toBe(false);
    });

    it("starts with no children", () => {
      expect(useStore.getState().children).toHaveLength(0);
    });

    it("starts with empty activities", () => {
      expect(useStore.getState().activities).toHaveLength(0);
    });
  });

  describe("setChild", () => {
    it("sets child profile", () => {
      const child = { id: "c1", nickname: "민수", age: 5 as const, gender: "male" as const, createdAt: new Date().toISOString() };
      useStore.getState().setChild(child);
      expect(useStore.getState().child?.nickname).toBe("민수");
    });
  });

  describe("setTemperament", () => {
    it("sets temperament answers", () => {
      const answers = { newEnvironment: "bold" as const, fasterThanPeers: ["언어"], currentObsession: ["공룡"] };
      useStore.getState().setTemperament(answers);
      expect(useStore.getState().temperament?.newEnvironment).toBe("bold");
    });
  });

  describe("completeOnboarding", () => {
    it("generates sample data on completion", () => {
      const child = { id: "c1", nickname: "민수", age: 5 as const, gender: "male" as const, createdAt: new Date().toISOString() };
      useStore.getState().setChild(child);
      useStore.getState().completeOnboarding();
      
      const state = useStore.getState();
      expect(state.onboardingComplete).toBe(true);
      expect(state.activities.length).toBeGreaterThan(0);
      expect(state.weeklyReport).not.toBeNull();
      expect(state.recommendations.length).toBeGreaterThan(0);
      expect(state.products.length).toBeGreaterThan(0);
      expect(state.monthlyData.length).toBeGreaterThan(0);
      expect(state.milestones.length).toBeGreaterThan(0);
      expect(state.children).toHaveLength(1);
      expect(state.activeChildId).toBe("c1");
    });
  });

  describe("addActivity", () => {
    it("adds an activity to the list", () => {
      useStore.getState().addActivity({
        id: "test-1",
        type: "activity",
        timestamp: new Date().toISOString(),
        data: { category: "퍼즐", durationMin: 30 },
      });
      expect(useStore.getState().activities).toHaveLength(1);
    });

    it("prepends new activity", () => {
      useStore.getState().addActivity({
        id: "test-1",
        type: "activity",
        timestamp: new Date().toISOString(),
        data: { category: "퍼즐", durationMin: 30 },
      });
      useStore.getState().addActivity({
        id: "test-2",
        type: "reading",
        timestamp: new Date().toISOString(),
        data: { bookTitle: "테스트", readAlone: true },
      });
      expect(useStore.getState().activities[0].id).toBe("test-2");
    });
  });

  describe("deleteActivity", () => {
    it("removes activity by id", () => {
      useStore.getState().addActivity({
        id: "test-1",
        type: "activity",
        timestamp: new Date().toISOString(),
        data: { category: "퍼즐", durationMin: 30 },
      });
      useStore.getState().deleteActivity("test-1");
      expect(useStore.getState().activities).toHaveLength(0);
    });
  });

  describe("updateActivity", () => {
    it("updates activity fields", () => {
      useStore.getState().addActivity({
        id: "test-1",
        type: "activity",
        timestamp: new Date().toISOString(),
        data: { category: "퍼즐", durationMin: 30 },
      });
      useStore.getState().updateActivity("test-1", {
        data: { category: "블록", durationMin: 45 },
      });
      const updated = useStore.getState().activities.find((a) => a.id === "test-1");
      expect((updated?.data as { category: string }).category).toBe("블록");
    });
  });

  describe("multi-child management", () => {
    it("adds and switches children", () => {
      const child1 = { id: "c1", nickname: "민수", age: 5 as const, gender: "male" as const, createdAt: new Date().toISOString() };
      const child2 = { id: "c2", nickname: "지수", age: 4 as const, gender: "female" as const, createdAt: new Date().toISOString() };
      
      useStore.getState().addChild(child1);
      useStore.getState().addChild(child2);
      
      expect(useStore.getState().children).toHaveLength(2);
      expect(useStore.getState().activeChildId).toBe("c2");
      
      useStore.getState().switchChild("c1");
      expect(useStore.getState().activeChildId).toBe("c1");
      expect(useStore.getState().child?.nickname).toBe("민수");
    });

    it("removes child and switches to another", () => {
      const child1 = { id: "c1", nickname: "민수", age: 5 as const, gender: "male" as const, createdAt: new Date().toISOString() };
      const child2 = { id: "c2", nickname: "지수", age: 4 as const, gender: "female" as const, createdAt: new Date().toISOString() };
      
      useStore.getState().addChild(child1);
      useStore.getState().addChild(child2);
      useStore.getState().removeChild("c2");
      
      expect(useStore.getState().children).toHaveLength(1);
      expect(useStore.getState().activeChildId).toBe("c1");
    });
  });

  describe("resetAll", () => {
    it("resets all state", () => {
      const child = { id: "c1", nickname: "민수", age: 5 as const, gender: "male" as const, createdAt: new Date().toISOString() };
      useStore.getState().setChild(child);
      useStore.getState().completeOnboarding();
      useStore.getState().resetAll();
      
      const state = useStore.getState();
      expect(state.onboardingComplete).toBe(false);
      expect(state.children).toHaveLength(0);
      expect(state.activities).toHaveLength(0);
      expect(state.child).toBeNull();
    });
  });
});
