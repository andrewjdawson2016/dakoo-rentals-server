const { validateNewBuilding } = require("../building");

describe("Building Schema Validation through validateNewBuilding", () => {
  const validBuilding = {
    address: "123 Main St",
    nickname: "Main Building",
    building_type: "SINGLE_FAMILY",
    unit_numbers: [],
    first_rental_month: "2023-01",
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

  describe("first_rental_month", () => {
    it("should accept a valid first_rental_month", () => {
      const result = validateNewBuilding(validBuilding);
      expect(result.error).toBeUndefined();
    });

    it("should reject an invalid first_rental_month format", () => {
      const result = validateNewBuilding({
        ...validBuilding,
        first_rental_month: "01-2023",
      });
      expect(result.error).toBeDefined();
    });

    it("should require first_rental_month", () => {
      const { first_rental_month, ...rest } = validBuilding;
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
