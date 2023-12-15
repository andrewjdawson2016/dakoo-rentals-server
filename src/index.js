const express = require("express");
const bodyParser = require("body-parser");
const routers = require("./routes");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/properties", routers.unitsRouter);
app.use("/leases", routers.leasesRouter);
app.use("/tenants", routers.tenantRouter);
app.use("/lease_notes", routers.leaseNoteRouter);
app.use("/lease_events", routers.leaseEventRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
