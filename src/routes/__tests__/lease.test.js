const { validateNewLease } = require("../lease");

describe("validateNewLease", () => {
  const validLease = {
    unit_id: 1,
    start_date: "2023-04-01",
    end_date: "2023-12-31",
    price_per_month: 1000,
    is_renewal: false,
    tenants: [
      {
        name: "John Doe",
        email: "john.doe@example.com",
      },
    ],
  };

  it("should return an error for an invalid unit_id", () => {
    const result = validateNewLease({
      ...validLease,
      unit_id: -1,
    });
    expect(result.error).toBeDefined();
  });

  it("should return an error for an incorrectly formatted start_date", () => {
    const result = validateNewLease({
      ...validLease,
      start_date: "2023-04-01T00:00",
    });
    expect(result.error).toBeDefined();
  });

  it("should return an error for an incorrectly formatted end_date", () => {
    const result = validateNewLease({
      ...validLease,
      end_date: "2023-04-01T00:00",
    });
    expect(result.error).toBeDefined();
  });

  it("should return an error if end_date is less than one month after start_date", () => {
    const result = validateNewLease({
      ...validLease,
      end_date: "2023-04-15",
    });
    expect(result.error).toBeDefined();
  });

  it("should return an error for a negative rental price", () => {
    const result = validateNewLease({
      ...validLease,
      price_per_month: -1000,
    });
    expect(result.error).toBeDefined();
  });

  it("should return an error if is_renewal is false but tenants are not provided", () => {
    const result = validateNewLease({
      ...validLease,
      is_renewal: false,
      tenants: [],
    });
    expect(result.error).toBeDefined();
  });

  it("should return an error if is_renewal is true but tenants are provided", () => {
    const result = validateNewLease({
      ...validLease,
      is_renewal: true,
      tenants: [
        {
          name: "John Doe",
          email: "john.doe@example.com",
        },
      ],
    });
    expect(result.error).toBeDefined();
  });

  it("should return an error if tenants do not have valid name", () => {
    const result = validateNewLease({
      ...validLease,
      tenants: [
        {
          name: "John123",
          email: "john.doe@example.com",
        },
      ],
    });
    expect(result.error).toBeDefined();
  });

  it("should return an error if tenants do not have valid email", () => {
    const result = validateNewLease({
      ...validLease,
      tenants: [
        {
          name: "John Doe",
          email: "john.doe",
        },
      ],
    });
    expect(result.error).toBeDefined();
  });
});
