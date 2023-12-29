const { router: buildingsRouter } = require("./building");
const { router: leasesRouter } = require("./lease");
const { router: tenantRouter } = require("./tenant");
const { router: leaseNoteRouter } = require("./lease_note");
const { router: leaseEventRouter } = require("./lease_event");
const { router: expensesRouter } = require("./expense");
const { router: usersRouter } = require("./user");

module.exports = {
  buildingsRouter,
  leasesRouter,
  expensesRouter,
  tenantRouter,
  leaseNoteRouter,
  leaseEventRouter,
  usersRouter,
};
