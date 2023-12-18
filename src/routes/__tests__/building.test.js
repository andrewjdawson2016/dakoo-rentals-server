const { validateNewBuilding } = require("../building");

describe("Building Schema Validation through validateNewBuilding", () => {
  const validBuilding = {
    address: "123 Main St",
    monthly_expenses: 1000,
    nickname: "Main Building",
    building_type: "SINGLE_FAMILY",
    unit_numbers: [],
  };

  describe("address", () => {
    it("should validate a proper address", () => {
      const result = validateNewBuilding(validBuilding);
      expect(result.error).toBeUndefined();
    });

    it("should reject an address exceeding 255 characters", () => {
      const longAddress = "a".repeat(256);
      const result = validateNewBuilding({
        ...validBuilding,
        address: longAddress,
      });
      expect(result.error).toBeDefined();
    });

    it("should require address", () => {
      const { address, ...rest } = validBuilding;
      const result = validateNewBuilding(rest);
      expect(result.error).toBeDefined();
    });
  });

  describe("monthly_expenses", () => {
    it("should accept valid monthly expenses", () => {
      const result = validateNewBuilding(validBuilding);
      expect(result.error).toBeUndefined();
    });

    it("should reject negative monthly expenses", () => {
      const result = validateNewBuilding({
        ...validBuilding,
        monthly_expenses: -100,
      });
      expect(result.error).toBeDefined();
    });

    it("should reject non-integer monthly expenses", () => {
      const result = validateNewBuilding({
        ...validBuilding,
        monthly_expenses: "invalid",
      });
      expect(result.error).toBeDefined();
    });

    it("should require monthly expenses", () => {
      const { monthly_expenses, ...rest } = validBuilding;
      const result = validateNewBuilding(rest);
      expect(result.error).toBeDefined();
    });
  });

  describe("nickname", () => {
    it("should accept a valid nickname", () => {
      const result = validateNewBuilding(validBuilding);
      expect(result.error).toBeUndefined();
    });

    it("should reject a nickname exceeding 255 characters", () => {
      const longNickname = "n".repeat(256);
      const result = validateNewBuilding({
        ...validBuilding,
        nickname: longNickname,
      });
      expect(result.error).toBeDefined();
    });

    it("should require a nickname", () => {
      const { nickname, ...rest } = validBuilding;
      const result = validateNewBuilding(rest);
      expect(result.error).toBeDefined();
    });
  });

  describe("building_type", () => {
    it("should accept a valid building type", () => {
      const result = validateNewBuilding(validBuilding);
      expect(result.error).toBeUndefined();
    });

    it("should reject an invalid building type", () => {
      const result = validateNewBuilding({
        ...validBuilding,
        building_type: "INVALID_TYPE",
      });
      expect(result.error).toBeDefined();
    });

    it("should require building type", () => {
      const { building_type, ...rest } = validBuilding;
      const result = validateNewBuilding(rest);
      expect(result.error).toBeDefined();
    });
  });

  describe("unit_numbers", () => {
    it("should accept valid unit numbers for MULTI_FAMILY", () => {
      const result = validateNewBuilding({
        ...validBuilding,
        building_type: "MULTI_FAMILY",
        unit_numbers: ["A1", "B2", "C3"],
      });
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid format unit numbers", () => {
      const result = validateNewBuilding({
        ...validBuilding,
        building_type: "MULTI_FAMILY",
        unit_numbers: ["!@#", 123, "*&^"],
      });
      expect(result.error).toBeDefined();
    });

    it("should require non-empty unit numbers for MULTI_FAMILY", () => {
      const result = validateNewBuilding({
        ...validBuilding,
        building_type: "MULTI_FAMILY",
        unit_numbers: [],
      });
      expect(result.error).toBeDefined();
    });

    it("should accept empty unit numbers for SINGLE_FAMILY", () => {
      const result = validateNewBuilding(validBuilding);
      expect(result.error).toBeUndefined();
    });
  });
});
