const { getLeaseEvents, validateNewLease } = require("../lease");
const { DateTime } = require("luxon");

describe("getLeaseEvents", () => {
  it("should return only start and end events for leases of 2 months or less", () => {
    const events = getLeaseEvents("2022-01-01", "2022-02-28");
    expect(events).toEqual([
      { date: "2022-01-01", description: "START" },
      { date: "2022-02-28", description: "END" },
    ]);
  });

  it("should include 2 months and 1 month reminders for leases longer than 2 months but less or equal to 6 months", () => {
    const events = getLeaseEvents("2022-01-01", "2022-06-30");
    expect(events).toEqual([
      { date: "2022-01-01", description: "START" },
      { date: "2022-06-30", description: "END" },
      { date: "2022-04-30", description: "TWO_MONTH" },
      { date: "2022-05-30", description: "ONE_MONTH" },
    ]);
  });

  it("should include all reminders for leases longer than 6 months", () => {
    const events = getLeaseEvents("2022-01-01", "2022-12-31");
    expect(events).toEqual([
      { date: "2022-01-01", description: "START" },
      { date: "2022-12-31", description: "END" },
      { date: "2022-10-31", description: "TWO_MONTH" },
      { date: "2022-11-30", description: "ONE_MONTH" },
      { date: "2022-06-30", description: "SIX_MONTH" },
    ]);
  });
});

describe("validateNewLease", () => {
  it("should throw an error when tenants are provided for renewal lease", async () => {
    const existingLeases = [];
    await expect(
      validateNewLease("2023-01-01", "2023-02-01", true, [1], existingLeases)
    ).rejects.toThrow("Tenants cannot be provided for renewal lease.");
  });

  it("should throw an error when tenants are not provided for non-renewal lease", async () => {
    const existingLeases = [];
    await expect(
      validateNewLease("2023-01-01", "2023-02-01", false, [], existingLeases)
    ).rejects.toThrow("Tenants must be provided for non-renewal lease");
  });

  it("should throw an error if startDate is less than a month from endDate", async () => {
    const existingLeases = [];
    await expect(
      validateNewLease("2023-01-01", "2023-01-15", false, [1], existingLeases)
    ).rejects.toThrow(
      "StartDate should come at least one month before EndDate."
    );
  });

  it("should throw an error if the new lease overlaps with an existing lease", async () => {
    const existingLeases = [
      {
        startDate: DateTime.fromISO("2023-01-01"),
        endDate: DateTime.fromISO("2023-03-01"),
        isRenewal: false,
        tenantIds: [2],
      },
    ];

    // 1. leaseStartDate is within an existing lease period.
    await expect(
      validateNewLease("2023-01-15", "2023-03-15", false, [1], existingLeases)
    ).rejects.toThrow("New lease overlaps with an existing lease.");

    // 2. leaseEndDate is within an existing lease period.
    await expect(
      validateNewLease("2022-12-15", "2023-02-15", false, [1], existingLeases)
    ).rejects.toThrow("New lease overlaps with an existing lease.");

    // 3. The new lease fully encompasses an existing lease.
    await expect(
      validateNewLease("2022-1-15", "2023-02-15", false, [1], existingLeases)
    ).rejects.toThrow("New lease overlaps with an existing lease.");
  });
  it("should throw an error if only lease is a renewal", async () => {
    const existingLeases = [];
    await expect(
      validateNewLease("2023-01-01", "2023-02-01", true, [], existingLeases)
    ).rejects.toThrow("First lease for a property cannot be a renewal");
  });
  it("should throw an error if the new lease starts earlier than all existing leases and is a renewal", async () => {
    const existingLeases = [
      {
        startDate: DateTime.fromISO("2023-02-01"),
        endDate: DateTime.fromISO("2023-03-01"),
        isRenewal: false,
        tenantIds: [1],
      },
      {
        startDate: DateTime.fromISO("2023-03-02"),
        endDate: DateTime.fromISO("2023-04-02"),
        isRenewal: false,
        tenantIds: [2],
      },
    ];

    // Testing a renewal lease that starts earlier than all existing leases.
    await expect(
      validateNewLease("2022-12-01", "2023-01-31", true, [], existingLeases)
    ).rejects.toThrow("First lease for a property cannot be a renewal");
  });

  it("should throw an error if a renewal lease doesn't start directly after the previous lease", async () => {
    const existingLeases = [
      {
        startDate: DateTime.fromISO("2023-01-01"),
        endDate: DateTime.fromISO("2023-02-01"),
        isRenewal: false,
        tenantIds: [2],
      },
    ];
    await expect(
      validateNewLease("2023-02-03", "2023-03-03", true, [], existingLeases)
    ).rejects.toThrow("Renewal lease must start directly after previous lease");
  });

  it("should validate a correct non-renewal lease", async () => {
    const existingLeases = [];
    await expect(
      validateNewLease("2023-01-01", "2023-02-01", false, [1], existingLeases)
    ).resolves.not.toThrow();
  });

  it("should validate a correct renewal lease", async () => {
    const existingLeases = [
      {
        startDate: DateTime.fromISO("2023-01-01"),
        endDate: DateTime.fromISO("2023-02-01"),
        isRenewal: false,
        tenantIds: [2],
      },
    ];
    await expect(
      validateNewLease("2023-02-02", "2023-03-02", true, [], existingLeases)
    ).resolves.not.toThrow();
  });
});
