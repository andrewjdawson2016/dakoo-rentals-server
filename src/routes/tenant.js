const express = require("express");
const { TenantQueries } = require("../db/datastores/tenant");

const router = express.Router();

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await TenantQueries.delete(id);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  router,
};
