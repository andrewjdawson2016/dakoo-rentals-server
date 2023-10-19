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

module.exports = router;