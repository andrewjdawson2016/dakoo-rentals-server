const express = require("express");
const { TenantQueries } = require("../db/datastores/tenant");
const { InternalServiceErrorMsg } = require("./common");

const router = express.Router();

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const err = await TenantQueries.delete(id);
  if (err) {
    return res.status(500).json({ error: InternalServiceErrorMsg });
  }
  return res.status(204).send();
});

module.exports = {
  router,
};
