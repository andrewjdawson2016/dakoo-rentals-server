const { router: buildingsRouter } = require("./building");
const { router: unitsRouter } = require("./unit");
const { router: leasesRouter } = require("./lease");
const { router: tenantRouter } = require("./tenant");
const { router: leaseNoteRouter } = require("./lease_note");
const { router: leaseEventRouter } = require("./lease_event");

module.exports = {
  buildingsRouter,
  unitsRouter,
  leasesRouter,
  tenantRouter,
  leaseNoteRouter,
  leaseEventRouter,
};
