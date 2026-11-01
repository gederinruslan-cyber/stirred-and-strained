import { describe, expect, it } from "vitest";
import { countryFromAcceptLanguage, parseAgeCookie } from "../lib/age.ts";

describe("visitor country from Accept-Language", () => {
  it.each([
    ["en-GB,en;q=0.9", "GB"],
    ["en-US", "US"],
    ["pt-br;q=0.8", "BR"],
    ["de", "DE"],
    ["ja-JP", "JP"],
    ["en", undefined],
    ["*", undefined],
    [null, undefined],
  ])("%s → %s", (header, country) => {
    expect(countryFromAcceptLanguage(header)).toBe(country);
  });
});

describe("age cookie", () => {
  it("reads only a known answer with a country", () => {
    expect(parseAgeCookie("ok|GB")).toEqual({ answer: "ok", country: "GB" });
    expect(parseAgeCookie("zero|ZZ")).toEqual({ answer: "zero", country: "ZZ" });
    for (const bad of [undefined, "", "yes|GB", "ok", "ok|gb", "ok|GBR"])
      expect(parseAgeCookie(bad)).toBeNull();
  });
});
