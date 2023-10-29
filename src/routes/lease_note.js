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
  let { err } = validateNewLeaseNote(req.body);

  if (err) {
    return res.status(400).json({
      error: err.details[0].message,
    });
  }

  const { lease_id, note } = req.body;

  err = LeaseNoteQueries.insert(lease_id, note);
  if (err) {
    return res.status(500).json({ error: err.message });
  }
  return res.status(201).send();
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const err = await LeaseNoteQueries.delete(id);
  if (err) {
    return res.status(500).json({ error: InternalServiceErrorMsg });
  }
  return res.status(204).send();
});

module.exports = {
  router,
};
