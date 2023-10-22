const express = require("express");
const bodyParser = require("body-parser");
const routers = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/properties", routers.propertiesRouter);
app.use("/leases", routers.leasesRouter);
app.use("/tenant", routers.tenantRouter);
app.use("lease_note", routers.leaseNoteRouter);
app.use("lease_event", routers.leaseEventRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
