const express = require('express');
const bodyParser = require('body-parser');
const propertiesRouter = require('./routes/properties');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/properties', propertiesRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
