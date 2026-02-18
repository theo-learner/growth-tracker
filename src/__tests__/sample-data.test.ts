import { describe, it, expect } from "vitest";
import {
  generateSampleActivities,
  generateSampleWeeklyReport,
  generateSampleRecommendations,
  generateSampleProducts,
  generateSampleMonthlyData,
  generateSampleMilestones,
} from "@/lib/sample-data";

describe("generateSampleActivities", () => {
  it("returns an array of 17 sample activities", () => {
    const activities = generateSampleActivities("테스트");
    expect(activities).toHaveLength(17);
  });

  it("all activities are marked as sample", () => {
    const activities = generateSampleActivities("테스트");
    activities.forEach((act) => {
      expect(act.isSample).toBe(true);
    });
  });

  it("includes all activity types", () => {
    const activities = generateSampleActivities("테스트");
    const types = new Set(activities.map((a) => a.type));
    expect(types).toContain("activity");
    expect(types).toContain("question");
    expect(types).toContain("reading");
    expect(types).toContain("emotion");
    expect(types).toContain("photo");
  });

  it("uses the child name in activity details", () => {
    const activities = generateSampleActivities("민수");
    const firstActivity = activities[0];
    expect(JSON.stringify(firstActivity.data)).toContain("민수");
  });

  it("all activities have valid timestamps", () => {
    const activities = generateSampleActivities("테스트");
    activities.forEach((act) => {
      expect(new Date(act.timestamp).getTime()).not.toBeNaN();
    });
  });

  it("all activities have unique ids", () => {
    const activities = generateSampleActivities("테스트");
    const ids = activities.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("generateSampleWeeklyReport", () => {
  it("returns a report with all 5 Wechsler domains", () => {
    const report = generateSampleWeeklyReport("테스트");
    const domains = Object.keys(report.scores);
    expect(domains).toEqual([
      "verbalComprehension",
      "visualSpatial",
      "workingMemory",
      "processingSpeed",
      "fluidReasoning",
    ]);
  });

  it("scores are between 0 and 100", () => {
    const report = generateSampleWeeklyReport("테스트");
    Object.values(report.scores).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it("has highlights array", () => {
    const report = generateSampleWeeklyReport("테스트");
    expect(report.highlights.length).toBeGreaterThan(0);
  });

  it("has bands for each domain", () => {
    const report = generateSampleWeeklyReport("테스트");
    Object.values(report.bands).forEach((band) => {
      expect(band).toHaveProperty("band");
      expect(band).toHaveProperty("trend");
      expect(["up", "stable", "down"]).toContain(band.trend);
    });
  });
});

describe("generateSampleRecommendations", () => {
  it("returns non-empty recommendations", () => {
    const recs = generateSampleRecommendations("테스트");
    expect(recs.length).toBeGreaterThan(0);
  });

  it("each recommendation has required fields", () => {
    const recs = generateSampleRecommendations("테스트");
    recs.forEach((rec) => {
      expect(rec.title).toBeTruthy();
      expect(rec.description).toBeTruthy();
      expect(rec.reason).toBeTruthy();
      expect(rec.domains.length).toBeGreaterThan(0);
      expect(rec.duration).toBeTruthy();
      expect(rec.icon).toBeTruthy();
    });
  });
});

describe("generateSampleProducts", () => {
  it("returns non-empty products", () => {
    const products = generateSampleProducts();
    expect(products.length).toBeGreaterThan(0);
  });

  it("each product has required fields", () => {
    const products = generateSampleProducts();
    products.forEach((p) => {
      expect(p.name).toBeTruthy();
      expect(p.price).toBeTruthy();
      expect(p.reason).toBeTruthy();
      expect(p.link).toBeTruthy();
    });
  });
});

describe("generateSampleMonthlyData", () => {
  it("returns 7 months of data", () => {
    const data = generateSampleMonthlyData();
    expect(data).toHaveLength(7);
  });

  it("last 3 months are predicted", () => {
    const data = generateSampleMonthlyData();
    expect(data[4].predicted).toBe(true);
    expect(data[5].predicted).toBe(true);
    expect(data[6].predicted).toBe(true);
    expect(data[0].predicted).toBeUndefined();
  });
});

describe("generateSampleMilestones", () => {
  it("returns milestones with valid dates", () => {
    const milestones = generateSampleMilestones();
    expect(milestones.length).toBeGreaterThan(0);
    milestones.forEach((m) => {
      expect(m.id).toBeTruthy();
      expect(m.title).toBeTruthy();
      expect(new Date(m.achievedDate).getTime()).not.toBeNaN();
    });
  });
});
