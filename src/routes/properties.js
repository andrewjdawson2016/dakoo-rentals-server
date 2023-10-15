const express = require('express');
const { queries } = require('../db/database');

const router = express.Router();

router.post('/', (req, res) => {
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  queries.insertProperty(address)
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
    const result = await queries.getAllProperties();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
