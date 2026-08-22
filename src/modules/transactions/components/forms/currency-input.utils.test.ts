import { describe, expect, it } from "vitest";
import {
  centsToDigits,
  countDigits,
  digitsToCents,
  MAX_CENTS,
  parsePastedCurrencyToCents,
} from "./currency-input.utils";

describe("currency input utils", () => {
  describe("typing helpers", () => {
    it("counts only numeric digits in formatted values", () => {
      expect(countDigits("R$ 1.234,56")).toBe(6);
      expect(countDigits("abc")).toBe(0);
    });

    it("keeps the existing digit-to-cent typing behavior", () => {
      expect(digitsToCents("10324")).toBe(10324);
      expect(digitsToCents("00010324")).toBe(10324);
      expect(centsToDigits(10324)).toBe("10324");
    });
  });

  describe("parsePastedCurrencyToCents", () => {
    it.each([
      ["323,42", 32342],
      ["R$ 399,244", 39924],
      ["311.4235", 31142],
      ["94", 9400],
      ["  R$   94  ", 9400],
      ["12,3", 1230],
      ["12.", 1200],
      [",42", 42],
      ["0", 0],
      ["00094", 9400],
      ["999999,99", MAX_CENTS],
      ["999999,999", MAX_CENTS],
    ])("parses %s", (input, expected) => {
      expect(parsePastedCurrencyToCents(input)).toBe(expected);
    });

    it.each([
      "",
      "R$",
      "abc",
      "1.234,56",
      "1,234.56",
      "12,34,56",
      "12.34.56",
      "1000000",
      "1000000,00",
    ])("rejects invalid paste %s", (input) => {
      expect(parsePastedCurrencyToCents(input)).toBeUndefined();
    });
  });
});
