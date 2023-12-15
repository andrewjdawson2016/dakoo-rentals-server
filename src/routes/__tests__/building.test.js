const { validateNewBuilding } = require("../building");

describe("Building Schema Validation through validateNewBuilding", () => {
  describe("address", () => {
    it("should validate a proper address", () => {
      const result = validateNewBuilding({
        address: "123 Main St",
        monthly_expenses: 1000,
      });
      expect(result.error).toBeUndefined();
    });

    it("should reject an address exceeding 255 characters", () => {
      const longAddress = "a".repeat(256);
      const result = validateNewBuilding({
        address: longAddress,
        monthly_expenses: 1000,
      });
      expect(result.error).toBeDefined();
    });

    it("should require address", () => {
      const result = validateNewBuilding({ monthly_expenses: 1000 });
      expect(result.error).toBeDefined();
    });
  });

  describe("monthly_expenses", () => {
    it("should accept valid monthly expenses", () => {
      const result = validateNewBuilding({
        address: "123 Main St",
        monthly_expenses: 500,
      });
      expect(result.error).toBeUndefined();
    });

    it("should reject negative monthly expenses", () => {
      const result = validateNewBuilding({
        address: "123 Main St",
        monthly_expenses: -100,
      });
      expect(result.error).toBeDefined();
    });

    it("should reject non-integer monthly expenses", () => {
      const result = validateNewBuilding({
        address: "123 Main St",
        monthly_expenses: "invalid",
      });
      expect(result.error).toBeDefined();
    });

    it("should require monthly expenses", () => {
      const result = validateNewBuilding({ address: "123 Main St" });
      expect(result.error).toBeDefined();
    });
  });
});
