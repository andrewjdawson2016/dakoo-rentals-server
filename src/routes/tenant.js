const express = require("express");
const { TenantQueries } = require("../db/datastores/tenant");
const { parseDatabaseError } = require("./common");

const router = express.Router();

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await TenantQueries.delete(id);
    return res.status(204).send();
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to delete tenant: ${message}` });
  }
});

module.exports = {
  router,
};
