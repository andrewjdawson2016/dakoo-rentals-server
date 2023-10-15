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

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await queries.getPropertyById(id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
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
    const result = await queries.deletePropertyById(id);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
