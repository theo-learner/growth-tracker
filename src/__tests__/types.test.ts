import { describe, it, expect } from "vitest";
import { DOMAIN_LABELS } from "@/types";
import type { DomainKey, ChildProfile, ActivityRecord } from "@/types";

describe("DOMAIN_LABELS", () => {
  it("has all 5 Wechsler domains", () => {
    const keys = Object.keys(DOMAIN_LABELS);
    expect(keys).toHaveLength(5);
    expect(keys).toContain("verbalComprehension");
    expect(keys).toContain("visualSpatial");
    expect(keys).toContain("fluidReasoning");
    expect(keys).toContain("workingMemory");
    expect(keys).toContain("processingSpeed");
  });

  it("has Korean labels", () => {
    expect(DOMAIN_LABELS.verbalComprehension).toBe("언어이해");
    expect(DOMAIN_LABELS.visualSpatial).toBe("시공간");
    expect(DOMAIN_LABELS.fluidReasoning).toBe("유동추론");
    expect(DOMAIN_LABELS.workingMemory).toBe("작업기억");
    expect(DOMAIN_LABELS.processingSpeed).toBe("처리속도");
  });
});

describe("Type contracts", () => {
  it("ChildProfile satisfies shape", () => {
    const child: ChildProfile = {
      id: "c1",
      nickname: "테스트",
      age: 5,
      gender: "male",
      createdAt: new Date().toISOString(),
    };
    expect(child.id).toBeTruthy();
    expect([4, 5, 6]).toContain(child.age);
  });

  it("ActivityRecord satisfies shape", () => {
    const record: ActivityRecord = {
      id: "a1",
      type: "activity",
      timestamp: new Date().toISOString(),
      data: { category: "퍼즐", durationMin: 30 },
    };
    expect(record.type).toBe("activity");
  });

  it("DomainKey type is valid", () => {
    const key: DomainKey = "verbalComprehension";
    expect(DOMAIN_LABELS[key]).toBeTruthy();
  });
});
