const express = require("express");
const { LeaseNoteQueries } = require("../db/datastores/lease_note");
const Joi = require("@hapi/joi");

const router = express.Router();

const leaseNoteSchema = Joi.object({
  lease_id: Joi.number().positive().required().messages({
    "number.base": "Invalid lease_id.",
    "number.positive": "Invalid lease_id.",
    "any.required": "lease_id is required.",
  }),
  note: Joi.string().min(10).required().messages({
    "string.min": "Note must be at least 10 characters long.",
    "any.required": "Note is required.",
  }),
});

function validateNewLeaseNote(body) {
  return leaseNoteSchema.validate(body);
}

router.post("/", (req, res) => {
  const { error } = validateNewLeaseNote(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  const { lease_id, note } = req.body;

  LeaseNoteQueries.insert(lease_id, note)
    .then(() => {
      res.status(201).json({
        message: "Lease note added successfully",
      });
    })
    .catch((err) => {
      console.error("Error executing query", err.stack);
      res.status(500).json({ error: err.message });
    });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await LeaseNoteQueries.delete(id);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Lease note not found" });
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
