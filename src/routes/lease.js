const express = require("express");
const { LeaseQueries } = require("../db/datastores/lease");

const router = express.Router();

router.post("/", (req, res) => {
  const {
    property_id,
    start_date,
    end_date,
    price_per_month,
    is_renewal,
    note,
    tenants,
  } = req.body;

  if (typeof property_id !== "number" || property_id <= 0) {
    return res.status(400).json({ error: "Invalid property_id." });
  }

  const startDate = DateTime.fromFormat(start_date, "yyyy-MM-dd");
  const endDate = DateTime.fromFormat(end_date, "yyyy-MM-dd");
  if (!startDate.isValid || !endDate.isValid) {
    return res.status(400).json({
      error: "Invalid start_date or end_date format. Use YYYY-MM-DD.",
    });
  }

  if (startDate.plus({ months: 1 }) > endDate) {
    return res.status(400).json({
      error: "start_date should come at least one month before end_date.",
    });
  }

  if (typeof price_per_month !== "number" || price_per_month <= 0) {
    return res.status(400).json({ error: "Invalid price_per_month." });
  }

  if (typeof is_renewal !== "boolean") {
    return res.status(400).json({ error: "is_renewal must be a boolean." });
  }

  if (is_renewal) {
    if (tenants) {
      return res.status(400).json({
        error: "Tenants should not be provided when lease is a renewal.",
      });
    }
  } else {
    if (!tenants || tenants.length === 0) {
      return res.status(400).json({
        error: "Tenants must be provided when lease is not a renewal.",
      });
    }

    for (let tenant of tenants) {
      if (
        !tenant.name ||
        typeof tenant.name !== "string" ||
        !tenant.email ||
        typeof tenant.email !== "string"
      ) {
        return res
          .status(400)
          .json({ error: "Each tenant must have a valid name and email." });
      }

      const nameRegex = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
      if (!nameRegex.test(tenant.name)) {
        return res.status(400).json({
          error: `Invalid name format for tenant: ${tenant.name}. Expected format: "First Last".`,
        });
      }

      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!emailRegex.test(tenant.email)) {
        return res
          .status(400)
          .json({ error: `Invalid email format for tenant: ${tenant.email}.` });
      }
    }
  }

  LeaseQueries.createLease(
    property_id,
    start_date,
    end_date,
    price_per_month,
    is_renewal,
    note,
    tenants
  )
    .then((leaseId) => {
      res.status(201).json({ message: "Lease created successfully.", leaseId });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await LeaseQueries.deleteLeaseById(id);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Lease not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
