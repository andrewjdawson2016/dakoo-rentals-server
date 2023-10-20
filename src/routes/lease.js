const express = require('express');
const { LeaseQueries } = require('../db/datastores/lease');

const router = express.Router();

router.post('/', (req, res) => {
    const { propertyId, startDate, endDate, pricePerMonth, isRenewal, note, tenants } = req.body;

    createLease(propertyId, startDate, endDate, pricePerMonth, isRenewal, note, tenants)
    .then((leaseId) => {
        res.status(201).json({ message: 'Lease created successfully.', leaseId });
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
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