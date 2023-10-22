const propertiesRouter = require("./property");
const leasesRouter = require("./lease");
const tenantRouter = require("./tenant");
const leaseNoteRouter = require("./lease_note");
const leaseEventRouter = require("./lease_event");

module.exports = {
  propertiesRouter,
  leasesRouter,
  tenantRouter,
  leaseNoteRouter,
  leaseEventRouter,
};
