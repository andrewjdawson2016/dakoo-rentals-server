const express = require('express');
const bodyParser = require('body-parser');
const { queries } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/addProperty', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
