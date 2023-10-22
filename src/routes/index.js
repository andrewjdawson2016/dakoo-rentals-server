const { router: propertiesRouter } = require("./property");
const { router: leasesRouter } = require("./lease");
const { router: tenantRouter } = require("./tenant");
const { router: leaseNoteRouter } = require("./lease_note");
const { router: leaseEventRouter } = require("./lease_event");

module.exports = {
  propertiesRouter,
  leasesRouter,
  tenantRouter,
  leaseNoteRouter,
  leaseEventRouter,
};
