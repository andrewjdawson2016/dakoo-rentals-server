const { validateNewExpense } = require("../expense");

describe("Expense Schema Validation through validateNewExpense", () => {
  const validExpense = {
    building_id: 1,
    month_year: "2023-01",
    amount: 500,
    note: "Monthly expense",
  };

  describe("building_id", () => {
    it("should validate a proper building_id", () => {
      const result = validateNewExpense(validExpense);
      expect(result.error).toBeUndefined();
    });

    it("should reject a negative building_id", () => {
      const result = validateNewExpense({
        ...validExpense,
        building_id: -1,
      });
      expect(result.error).toBeDefined();
    });

    it("should require building_id", () => {
      const { building_id, ...rest } = validExpense;
      const result = validateNewExpense(rest);
      expect(result.error).toBeDefined();
    });
  });

  describe("month_year", () => {
    it("should accept a valid month_year", () => {
      const result = validateNewExpense(validExpense);
      expect(result.error).toBeUndefined();
    });

    it("should reject an invalid month_year format", () => {
      const result = validateNewExpense({
        ...validExpense,
        month_year: "01-2023",
      });
      expect(result.error).toBeDefined();
    });

    it("should require month_year", () => {
      const { month_year, ...rest } = validExpense;
      const result = validateNewExpense(rest);
      expect(result.error).toBeDefined();
    });
  });

  describe("amount", () => {
    it("should accept a valid amount", () => {
      const result = validateNewExpense(validExpense);
      expect(result.error).toBeUndefined();
    });

    it("should accept a zero amount", () => {
      const result = validateNewExpense({
        ...validExpense,
        amount: 0,
      });
      expect(result.error).toBeUndefined();
    });

    it("should reject a negative amount", () => {
      const result = validateNewExpense({
        ...validExpense,
        amount: -100,
      });
      expect(result.error).toBeDefined();
    });

    it("should require amount", () => {
      const { amount, ...rest } = validExpense;
      const result = validateNewExpense(rest);
      expect(result.error).toBeDefined();
    });
  });

  describe("note", () => {
    it("should accept a valid note", () => {
      const result = validateNewExpense(validExpense);
      expect(result.error).toBeUndefined();
    });

    it("should accept empty note", () => {
      const result = validateNewExpense({
        ...validExpense,
        note: "",
      });
      expect(result.error).toBeUndefined();
    });
  });
});
