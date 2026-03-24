import { describe, it, expect } from "vitest";
import {
  parsePrice,
  parseSurface,
  calculatePricePerM2,
  formatPricePerM2,
} from "./parsing.js";

describe("parsePrice", () => {
  it("parses a simple price", () => {
    expect(parsePrice("€286,470*")).toBe(286470);
  });

  it("parses price without asterisk", () => {
    expect(parsePrice("€525,000")).toBe(525000);
  });

  it("parses price with dots as thousand separators", () => {
    expect(parsePrice("€1.950.000*")).toBe(1950000);
  });

  it("parses Dutch format with space and dots", () => {
    expect(parsePrice("€ 145.000")).toBe(145000);
  });

  it("parses Dutch large price", () => {
    expect(parsePrice("€ 2.150.000")).toBe(2150000);
  });

  it("parses French format (spaces, € at end)", () => {
    expect(parsePrice("620 000 €")).toBe(620000);
  });

  it("parses French large price", () => {
    expect(parsePrice("2 150 000 €")).toBe(2150000);
  });

  it("returns null for EN price ranges (hyphen)", () => {
    expect(parsePrice("€205,000 - €473,850*")).toBeNull();
  });

  it("returns null for NL/FR price ranges (en-dash)", () => {
    expect(parsePrice("€ 205.000 – €473.850*")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parsePrice("")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(parsePrice(null)).toBeNull();
  });

  it("returns null for non-numeric text", () => {
    expect(parsePrice("Price on request")).toBeNull();
  });

  it("returns null for zero price", () => {
    expect(parsePrice("€0")).toBeNull();
  });

  it("parses starting price prefix", () => {
    expect(parsePrice("Starting price : €230,000")).toBe(230000);
  });

  it("returns null for price + monthly cost", () => {
    expect(parsePrice("€97,500 + €1,475/month")).toBeNull();
  });
});

describe("parseSurface", () => {
  it("parses surface from EN property info text", () => {
    expect(parseSurface("3 bdr. \n3 bedrooms\n· 140 m²\nsquare meters")).toBe(
      140
    );
  });

  it("parses surface from NL property info text", () => {
    expect(parseSurface("2 slp. 2 slaapkamers · 70 m² vierkante meters")).toBe(
      70
    );
  });

  it("parses surface from FR property info text", () => {
    expect(parseSurface("3 ch. 3 chambres · 170 m² mètres carrés")).toBe(170);
  });

  it("parses standalone surface", () => {
    expect(parseSurface("82 m²")).toBe(82);
  });

  it("parses surface with dot separator", () => {
    expect(parseSurface("1.200 m²")).toBe(1200);
  });

  it("returns null when no m² found", () => {
    expect(parseSurface("3 bedrooms")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseSurface("")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(parseSurface(null)).toBeNull();
  });

  it("returns null for zero surface", () => {
    expect(parseSurface("0 m²")).toBeNull();
  });
});

describe("calculatePricePerM2", () => {
  it("calculates price per m² correctly", () => {
    expect(calculatePricePerM2(525000, 82)).toBe(6402);
  });

  it("rounds to nearest integer", () => {
    expect(calculatePricePerM2(286470, 140)).toBe(2046);
  });

  it("returns null for zero surface", () => {
    expect(calculatePricePerM2(525000, 0)).toBeNull();
  });

  it("returns null for null price", () => {
    expect(calculatePricePerM2(null, 82)).toBeNull();
  });

  it("returns null for null surface", () => {
    expect(calculatePricePerM2(525000, null)).toBeNull();
  });
});

describe("formatPricePerM2", () => {
  it("formats value as EUR/m²", () => {
    const result = formatPricePerM2(6402);
    expect(result).toContain("6.402");
    expect(result).toContain("/m²");
    expect(result).toContain("€");
  });

  it("formats small value", () => {
    const result = formatPricePerM2(500);
    expect(result).toContain("500");
    expect(result).toContain("/m²");
  });

  it("returns null for non-finite value", () => {
    expect(formatPricePerM2(Infinity)).toBeNull();
    expect(formatPricePerM2(NaN)).toBeNull();
  });
});
