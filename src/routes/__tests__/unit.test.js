const { validateNewUnit } = require("../unit");

describe("Unit Schema Validation through validateNewUnit", () => {
  describe("building_id", () => {
    it("should validate a positive building_id", () => {
      const result = validateNewUnit({
        building_id: 10,
        unit_type: "SINGLE_FAMILY",
      });
      expect(result.error).toBeUndefined();
    });

    it("should reject a negative building_id", () => {
      const result = validateNewUnit({
        building_id: -5,
        unit_type: "SINGLE_FAMILY",
      });
      expect(result.error).toBeDefined();
    });

    it("should require building_id", () => {
      const result = validateNewUnit({ unit_type: "SINGLE_FAMILY" });
      expect(result.error).toBeDefined();
    });
  });

  describe("unit_type", () => {
    it("should accept SINGLE_FAMILY as a unit_type", () => {
      const result = validateNewUnit({
        building_id: 1,
        unit_type: "SINGLE_FAMILY",
      });
      expect(result.error).toBeUndefined();
    });

    it("should reject an invalid unit_type", () => {
      const result = validateNewUnit({
        building_id: 1,
        unit_type: "INVALID_TYPE",
      });
      expect(result.error).toBeDefined();
    });

    it("should require unit_type", () => {
      const result = validateNewUnit({ building_id: 1 });
      expect(result.error).toBeDefined();
    });
  });

  describe("unit_type MULTI_FAMILY", () => {
    it("should require unit_number for MULTI_FAMILY", () => {
      const resultWithoutUnitNumber = validateNewUnit({
        building_id: 1,
        unit_type: "MULTI_FAMILY",
      });
      expect(resultWithoutUnitNumber.error).toBeDefined();

      const resultWithUnitNumber = validateNewUnit({
        building_id: 1,
        unit_type: "MULTI_FAMILY",
        unit_number: "101",
      });
      expect(resultWithUnitNumber.error).toBeUndefined();
    });
  });

  describe("unit_number", () => {
    it("should accept a unit_number for MULTI_FAMILY", () => {
      const result = validateNewUnit({
        building_id: 1,
        unit_type: "MULTI_FAMILY",
        unit_number: "101",
      });
      expect(result.error).toBeUndefined();
    });

    it("should reject unit_number for SINGLE_FAMILY", () => {
      const result = validateNewUnit({
        building_id: 1,
        unit_type: "SINGLE_FAMILY",
        unit_number: "101",
      });
      expect(result.error).toBeDefined();
    });

    it("should require unit_number for MULTI_FAMILY", () => {
      const result = validateNewUnit({
        building_id: 1,
        unit_type: "MULTI_FAMILY",
      });
      expect(result.error).toBeDefined();
    });
  });
});
