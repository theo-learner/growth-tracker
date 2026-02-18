import { describe, it, expect, vi, beforeEach } from "vitest";
import { callApi } from "@/lib/api-client";

describe("callApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls fetch with correct URL and headers", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ data: "test" }) };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    await callApi("/api/test");

    expect(fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("throws on non-ok response", async () => {
    const mockResponse = { ok: false, status: 500 };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    await expect(callApi("/api/test")).rejects.toThrow("API call failed: 500");
  });

  it("returns parsed JSON on success", async () => {
    const mockData = { result: "success" };
    const mockResponse = { ok: true, json: () => Promise.resolve(mockData) };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    const result = await callApi("/api/test");
    expect(result).toEqual(mockData);
  });

  it("passes custom options to fetch", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({}) };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    await callApi("/api/test", { method: "POST", body: JSON.stringify({ key: "value" }) });

    expect(fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ key: "value" }),
      })
    );
  });
});
