const express = require('express');
const { pool, queries } = require("../db/database");

const router = express.Router();

// TODO: validate start_date, end_date and price_per_month
router.post('/', (req, res) => {
    const { property_id, start_date, end_date, price_per_month, note } = req.body;

    createLeaseWithNoteAndEvents(property_id, start_date, end_date, price_per_month, note)
    .then((leaseId) => {
        res.status(201).json({ message: 'Lease created successfully.', leaseId });
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});


// TODO: this should include the lease_notes and lease_events
router.get('/', async (req, res) => {
    try {
      const result = await queries.getAllLeases();
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
      const result = await queries.getLeaseById(id);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lease not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
      const result = await queries.deleteLeaseById(id);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Lease not found' });
      }
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

const createLeaseWithNoteAndEvents = async (property_id, start_date, end_date, price_per_month, note) => {
    await pool.query('BEGIN');

    try {
        const leaseQueryText = 'INSERT INTO lease(property_id, start_date, end_date, price_per_month) VALUES($1, $2, $3, $4) RETURNING id';
        const leaseValues = [property_id, start_date, end_date, price_per_month];
        const leaseResult = await pool.query(leaseQueryText, leaseValues);
        const leaseId = leaseResult.rows[0].id;

        if (note) {
            const noteQueryText = 'INSERT INTO lease_note (lease_id, note) VALUES ($1, $2)';
            const noteValues = [leaseId, note];
            await pool.query(noteQueryText, noteValues);
        }

        const events = getLeaseEvents(new Date(start_date), new Date(end_date));
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

const getLeaseEvents = (startDate, endDate) => {
    const eventDates = [
        { date: startDate.toISOString(), description: 'start of lease' },
        { date: endDate.toISOString(), description: 'end of lease' },
    ];
    const sixMonthsBeforeEnd = new Date(endDate);
    sixMonthsBeforeEnd.setMonth(sixMonthsBeforeEnd.getMonth() - 6);

    const twoMonthsBeforeEnd = new Date(endDate);
    console.log("twoMonthsBeforeEnd: ", twoMonthsBeforeEnd)
    twoMonthsBeforeEnd.setMonth(twoMonthsBeforeEnd.getMonth() - 2);
    console.log("after sub: ", twoMonthsBeforeEnd)

    const oneMonthBeforeEnd = new Date(endDate);
    oneMonthBeforeEnd.setMonth(oneMonthBeforeEnd.getMonth() - 1);

    if (sixMonthsBeforeEnd > startDate) eventDates.push({date: sixMonthsBeforeEnd.toISOString(), description: 'send renewal option at 6 months'});
    if (twoMonthsBeforeEnd > startDate) eventDates.push({date: twoMonthsBeforeEnd.toISOString(), description: 'send renewal reminder at 2 months'});
    if (oneMonthBeforeEnd > startDate) eventDates.push({date: oneMonthBeforeEnd.toISOString(), description: 'renewal deadline'});

    return eventDates;
};

module.exports = router;