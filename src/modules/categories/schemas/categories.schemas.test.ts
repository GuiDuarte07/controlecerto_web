import { describe, expect, it } from "vitest";
import { zodResolver } from "@hookform/resolvers/zod";
import { BillTypeEnum } from "../types/categories.types";
import { categoryFormSchema } from "./categories.schemas";

const validCategory = {
  name: "Assinaturas",
  icon: "creditCard",
  billType: BillTypeEnum.EXPENSE,
  color: "#166F31",
  parentId: null,
};

describe("categoryFormSchema", () => {
  it.each([undefined, null, 0, ""])("submits a color-only edit without requiring a budget (%s)", async (limit) => {
    const resolver = zodResolver(categoryFormSchema);
    const result = await resolver(
      { ...validCategory, color: "#A855F7", limit },
      undefined,
      { fields: {}, shouldUseNativeValidation: false },
    );
    expect(result.errors).toEqual({});
    expect(result.values).toMatchObject({ color: "#A855F7", limit: null });
  });

  it.each([
    ["empty string", ""],
    ["null", null],
    ["undefined", undefined],
    ["number zero", 0],
    ["string zero", "0"],
  ])("treats %s limit as optional", (_, limit) => {
    const result = categoryFormSchema.safeParse({
      ...validCategory,
      limit,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBeNull();
    }
  });

  it("accepts a positive budget limit", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategory,
      limit: "250.75",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(250.75);
    }
  });

  it("rejects negative budget limit with the translation key", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategory,
      limit: "-10",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "categories.errors.limitPositive",
      );
    }
  });
});
