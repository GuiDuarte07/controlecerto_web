import { describe, expect, it } from "vitest";
import { createInvestmentSchema, depositWithdrawSchema } from "./investments.schemas";
import pt from "../../../translations/pt.json";
import en from "../../../translations/en.json";

describe("investment amounts", () => {
  it.each([undefined, 0, 125.75])("accepts initial amount %s", (initialAmount) => {
    expect(createInvestmentSchema.safeParse({
      name: "Reserva", startDate: new Date(), initialAmount,
    }).success).toBe(true);
  });

  it("rejects negative initial amounts with a translated error", () => {
    const result = createInvestmentSchema.safeParse({
      name: "Reserva", startDate: new Date(), initialAmount: -1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("investments.errors.amountNonNegative");
      expect(pt.investments.errors.amountNonNegative).toBeTruthy();
      expect(en.investments.errors.amountNonNegative).toBeTruthy();
    }
  });

  it("still requires positive deposits and withdrawals", () => {
    expect(depositWithdrawSchema.safeParse({ amount: 0 }).success).toBe(false);
  });
});
