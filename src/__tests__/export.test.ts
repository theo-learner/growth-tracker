import { describe, it, expect } from "vitest";
import { activitiesToCSV, exportAllDataAsJSON } from "@/lib/export";
import { generateSampleActivities } from "@/lib/sample-data";

describe("activitiesToCSV", () => {
  it("returns CSV with header row", () => {
    const csv = activitiesToCSV([]);
    expect(csv).toContain("날짜,시간,유형,내용,상세");
  });

  it("converts activities to CSV rows", () => {
    const activities = generateSampleActivities("테스트");
    const csv = activitiesToCSV(activities);
    const lines = csv.split("\n");
    // header + 17 activities
    expect(lines).toHaveLength(18);
  });

  it("escapes double quotes in CSV", () => {
    const activities = [
      {
        id: "test-1",
        type: "question" as const,
        timestamp: new Date().toISOString(),
        data: { quote: 'He said "hello"', context: "test" },
      },
    ];
    const csv = activitiesToCSV(activities);
    expect(csv).toContain('""hello""');
  });
});

describe("exportAllDataAsJSON", () => {
  it("returns valid JSON string", () => {
    const json = exportAllDataAsJSON({ child: null, activities: [] });
    const parsed = JSON.parse(json);
    expect(parsed).toHaveProperty("child");
    expect(parsed).toHaveProperty("activities");
  });

  it("includes child and activities data", () => {
    const child = {
      id: "test-child",
      nickname: "테스트",
      age: 5 as const,
      gender: "male" as const,
      createdAt: new Date().toISOString(),
    };
    const activities = generateSampleActivities("테스트");
    const json = exportAllDataAsJSON({ child, activities });
    const parsed = JSON.parse(json);
    expect(parsed.child.nickname).toBe("테스트");
    expect(parsed.activities).toHaveLength(17);
  });
});
