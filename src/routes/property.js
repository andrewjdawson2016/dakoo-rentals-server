const express = require('express');
const { PropertyQueries } = require('../db/datastores/property');

const router = express.Router();

router.post('/', (req, res) => {
  const { address } = req.body;

  PropertyQueries.insertProperty(address)
    .then(() => {
      res.status(201).json({
        message: 'Property added successfully',
      });
    })
    .catch(err => {
      console.error('Error executing query', err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.get('/', async (req, res) => {
  try {
    const result = await PropertyQueries.getAllProperties();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
