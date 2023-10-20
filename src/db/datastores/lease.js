const { Lease, LeaseNote, LeaseEvent } = require("./types");
const { pool } = require("../conn");
const { DateTime } = require("luxon");

const LeaseQueries = {

};

const createLeaseWithNoteAndEvents = async (propertyId, startDate, endDate, pricePerMonth, note) => {
    await pool.query('BEGIN');

    try {
        const leaseQueryText = 'INSERT INTO lease(property_id, start_date, end_date, price_per_month) VALUES($1, $2, $3, $4) RETURNING id';
        const leaseValues = [propertyId, startDate, endDate, pricePerMonth];
        const leaseResult = await pool.query(leaseQueryText, leaseValues);
        const leaseId = leaseResult.rows[0].id;

        if (note) {
            const noteQueryText = 'INSERT INTO lease_note (lease_id, note) VALUES ($1, $2)';
            const noteValues = [leaseId, note];
            await pool.query(noteQueryText, noteValues);
        }

        const events = getLeaseEvents(startDate, endDate);
        for (let event of events) {
            const eventQueryText = 'INSERT INTO lease_event (lease_id, due_date, description) VALUES ($1, $2, $3)';
            const eventValues = [leaseId, event.date, event.description];
            await pool.query(eventQueryText, eventValues);
        }
        await pool.query('COMMIT');
        return leaseId;
    } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
    }
};

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