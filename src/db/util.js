const { DateTime } = require("luxon");

const getLeaseEvents = (startDateString, endDateString) => {
    const startDate = DateTime.fromISO(startDateString);
    const endDate = DateTime.fromISO(endDateString);

    const events = [
        { date: startDate.toISODate(), description: "start of lease" },        
        { date: endDate.toISODate(), description: "end of lease" },
    ];

    const leaseMonths = endDate.diff(startDate, 'months').months
    if (leaseMonths > 2) {
        events.push({ date: endDate.minus({months: 2}).toISODate(), description: "send two month reminder" });
        events.push({ date: endDate.minus({months: 1}).toISODate(), description: "renewal deadline" });
    }
    if (leaseMonths > 6) {
        events.push({ date: endDate.minus({months: 6}).toISODate(), description: "send six month renewal option" });
    }
    return events;
};

module.exports = {
    getLeaseEvents
  };