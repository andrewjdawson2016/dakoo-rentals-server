const express = require("express");
const { LeaseEventQueries } = require("../db/datastores/lease_event");
const Joi = require("@hapi/joi");

const router = express.Router();

const leaseEventSchema = Joi.object({
  id: Joi.number().positive().required().messages({
    "number.base": "Invalid id.",
    "number.positive": "Invalid id.",
    "any.required": "id is required.",
  }),
  execution_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "execution_date must be in YYYY-MM-DD format.",
      "any.required": "execution_date is required.",
    }),
});

function validateNewLeaseEvent(body) {
  return leaseEventSchema.validate(body);
}

router.patch("/", async (req, res) => {
  const { error } = validateNewLeaseEvent(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  const { id, execution_date } = req.body;

  try {
    await LeaseEventQueries.setExecutionDate(id, execution_date);
    res.status(200).json({
      message: "Execution date updated successfully",
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  router,
};
