const { getLeaseEvents } = require("../lease");

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
