const { validateNewExpense } = require("../expense");

describe("Expense Schema Validation through validateNewExpense", () => {
  const validExpense = {
    building_id: 1,
    month_year: "2023-01",
    fixed_amount: 500,
    variable_amount: 200,
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

  describe("fixed_amount", () => {
    it("should accept a valid fixed_amount", () => {
      const result = validateNewExpense(validExpense);
      expect(result.error).toBeUndefined();
    });

    it("should reject a negative fixed_amount", () => {
      const result = validateNewExpense({
        ...validExpense,
        fixed_amount: -100,
      });
      expect(result.error).toBeDefined();
    });

    it("should require fixed_amount", () => {
      const { fixed_amount, ...rest } = validExpense;
      const result = validateNewExpense(rest);
      expect(result.error).toBeDefined();
    });
  });

  describe("variable_amount", () => {
    it("should accept a valid variable_amount", () => {
      const result = validateNewExpense(validExpense);
      expect(result.error).toBeUndefined();
    });

    it("should reject a negative variable_amount", () => {
      const result = validateNewExpense({
        ...validExpense,
        variable_amount: -100,
      });
      expect(result.error).toBeDefined();
    });

    it("should require variable_amount", () => {
      const { variable_amount, ...rest } = validExpense;
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
