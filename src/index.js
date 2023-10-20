const express = require("express");
const bodyParser = require("body-parser");
const propertiesRouter = require("./routes/property");
const leasesRouter = require("./routes/lease");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/properties", propertiesRouter);
app.use("/leases", leasesRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
