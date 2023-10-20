const express = require("express");
const { PropertyQueries } = require("../db/datastores/property");

const router = express.Router();

router.post("/", (req, res) => {
  const { address } = req.body;

  if (!address || address.length < 10 || /^\d+$/.test(address)) {
    return res.status(400).json({
      error: "Invalid address. Please provide a valid address.",
    });
  }

  PropertyQueries.insertProperty(address)
    .then(() => {
      res.status(201).json({
        message: "Property added successfully",
      });
    })
    .catch((err) => {
      console.error("Error executing query", err.stack);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

router.get("/", async (req, res) => {
  try {
    const result = await PropertyQueries.getAllProperties();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await PropertyQueries.deleteProperty(id);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
