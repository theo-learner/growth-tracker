import { describe, it, expect } from "vitest";
import { generateCoupangLink, AFFILIATE_NOTICE } from "@/lib/affiliate";

describe("generateCoupangLink", () => {
  it("generates a valid coupang search URL", () => {
    const link = generateCoupangLink("퍼즐");
    expect(link).toContain("coupang.com");
    expect(link).toContain(encodeURIComponent("퍼즐"));
  });

  it("encodes special characters", () => {
    const link = generateCoupangLink("아이 퍼즐 세트");
    expect(link).toContain(encodeURIComponent("아이 퍼즐 세트"));
  });
});

describe("AFFILIATE_NOTICE", () => {
  it("contains required disclosure text", () => {
    expect(AFFILIATE_NOTICE).toContain("쿠팡 파트너스");
    expect(AFFILIATE_NOTICE).toContain("수수료");
  });
});
