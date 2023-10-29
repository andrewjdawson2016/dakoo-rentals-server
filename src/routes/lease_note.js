const express = require("express");
const { LeaseNoteQueries } = require("../db/datastores/lease_note");
const Joi = require("@hapi/joi");
const { parseDatabaseError } = require("./common");

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

router.post("/", async (req, res) => {
  let { e } = validateNewLeaseNote(req.body);

  if (e) {
    return res.status(400).json({
      error: e.details[0].message,
    });
  }

  const { lease_id, note } = req.body;

  try {
    await LeaseNoteQueries.insert(lease_id, note);
    return res.status(201).send();
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to create lease note: ${message}` });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await LeaseNoteQueries.delete(id);
    return res.status(204).send();
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to delete lease note: ${message}` });
  }
});

module.exports = {
  router,
};
