import { describe, it, expect, beforeEach } from "vitest";
import { t, setLocale, getLocale, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n";

describe("i18n", () => {
  beforeEach(() => {
    setLocale("ko");
  });

  it("default locale is ko", () => {
    expect(DEFAULT_LOCALE).toBe("ko");
    expect(getLocale()).toBe("ko");
  });

  it("returns Korean message by default", () => {
    expect(t("common.loading")).toBe("로딩 중...");
    expect(t("app.title")).toContain("성장 트래커");
  });

  it("returns English message when locale is en", () => {
    expect(t("common.loading", "en")).toBe("Loading...");
  });

  it("returns key when message not found", () => {
    expect(t("nonexistent.key")).toBe("nonexistent.key");
  });

  it("setLocale changes current locale", () => {
    setLocale("ko");
    expect(getLocale()).toBe("ko");
  });

  it("ignores unsupported locales", () => {
    setLocale("fr" as never);
    expect(getLocale()).toBe("ko");
  });

  it("SUPPORTED_LOCALES includes ko", () => {
    expect(SUPPORTED_LOCALES).toContain("ko");
  });
});
